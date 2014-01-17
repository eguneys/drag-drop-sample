drag-drop-sample
================

Sample Drag Drop application using Easeljs and Backbonejs

Live at : [http://drag-drop.herokuapp.com](http://drag-drop.herokuapp.com)




Hello,

In this article, We are going to build a simple, drag and drop application using [Easel.js](http://easeljs.com) and [Backbone.js](http://backbonejs.org)
Backbone will give structure to our application by providing *models*, *collections*, and *views*.
Easel will make working with the HTML5 Canvas element easy.
Although we don't necessarily need backbone.js for such a simple application, it is fun to get started with backbone in this way.

# The Result
Full code can be seen on [github](https://github.com/eguneys/drag-drop-sample). The live demo at [heroku](http://drag-drop.herokuapp.com/).
Click on the pink area to create a draggable stone. Stone will be draggable, and it will be constrained inside the pink area.

# Get Started

First, we create our directory structure as follows:

{% highlight bash %}
.
|-- index.html
`-- js
    |-- main.js
    |-- models
    |   `-- stone.js
    `-- views
        `-- view.js
{% endhighlight %}


Next, include our libraries and script files, and put a canvas element inside index.html.

{% highlight html %}
<body>

  <!-- Canvas Element -->
  <canvas id="testcanvas" height="640" width="480"/>


  <script src="/bower_components/jquery/jquery.min.js"></script>
  <!-- underscore is needed by backbone.js -->
  <script src="/bower_components/underscore/underscore-min.js"></script>
  <script src="/bower_components/backbone/backbone.js"></script>
  <script src="/bower_components/easeljs/lib/easeljs-0.7.1.min.js"></script>
  <!-- tweenjs is for some animations -->
  <script src="/bower_components/createjs-tweenjs/lib/tweenjs-0.5.1.min.js"></script>


  <script src="/js/models/stone.js"></script>
  <script src="/js/views/view.js"></script>
  <script src="/js/main.js"></script>
</body>
{% endhighlight %}

Now we are ready to manipulate this canvas element.

# Backbone Models

By creating a backbone model, we will  have key-value bindings and custom events on that model.
Meaning we can listen to changes for model properties and render our view accordingly.

A backbone collection, is ordered set of models. You can bind *change* events to be notified when
any model in the collection changes, listen for *add* and *remove* events.

Let's create a stone model, and a stone collection.

*js/models/stone.js*

{% highlight javascript %}

var Stone = Backbone.Model.extend({

});

var StoneCollection = Backbone.Collection.extend({
    model: Stone
});
{% endhighlight %}

# Initialize the Backbone View

Backbone views don't determine anything about HTML, and can be used with any Javascript templating library.
In our case we don't use any because we don't manipulate the dom. Instead we manipulate the canvas.
You can bind your view's *render*
function to the model's *change* event, and now when model data changes, it is
automatically updated.

      new View([options])

View defines an initialize function, it will be called when the view is first created. options parameter
is passed as an argument to initialize function.

To get started with Easel, we create a *Stage* that wraps the canvas element, and add
objects as children. Later we pass the *stage* to our backbone view.

*js/main.js*

{% highlight javascript %}
   $(document).ready(function() {
    var stage = new createjs.Stage('testcanvas');

    var view = new CanvasView({ stage: stage}).render();
    });
{% endhighlight %}

We've created our *CanvasView* and called its render function to render it. We will see how we implement render in just a second. First, let's see our initialize function.

*js/views/view.js*
{% highlight javascript %}
   var CanvasView = Backbone.View.extend({
    initialize: function(args) {
        // easeljs stage passed as argument.
        this.stage = args.stage;
        // enableMouseOver is necessary to enable mouseover event http://www.createjs.com/Docs/EaselJS/classes/DisplayObject.html#event_mouseover
        this.stage.enableMouseOver(20);

        // stone collection
        this.collection = new StoneCollection();

        // bounds of pink area and our stones. the pink area is called "rake".
        this.rakeOffsets = {
            x: 10,
            y: 400,
            height: 150,
            width: 300,
            stoneWidth: 50,
            stoneHeight: 50
        };

        // listen to collection's add remove and reset events and call the according function
        // to reflect changes.
        this.listenTo(this.collection, "add", this.renderStone, this);
        this.listenTo(this.collection, "remove", this.renderRake, this);
        this.listenTo(this.collection, "reset", this.renderRake, this);
    },

    //...
    });
{% endhighlight %}

*listenTo* listens for model/collection changes and calls the function passed as second argument.
We pass the context the function is being called to, as a third argument.

When we add a stone to our collection, *"add"* event will dispatch *this.renderStone* and pass the
new stone to the function. Simila
rly when the collection is *reset* *"reset"* event will
dispatch *this.renderRake*. Thus by implementing these render functions, view will always be
in sync with the collection.

# Render the View


*render* function just calls *this.renderRake()* and updates the *stage*.

*js/views/view.js*
{% highlight javascript %}
    render: function() {
        this.renderRake();

        // stage.update is needed to render the display to the canvas.
        // if we don't call this nothing will be seen.
        this.stage.update();

        // The Ticker provides a centralized tick at a set interval.
        // we set the fps for a smoother animation.
        createjs.Ticker.addEventListener("tick", this.stage);
        createjs.Ticker.setInterval(25);
        createjs.Ticker.setFPS(60);
    },
{% endhighlight %}

Here is the renderRake method:

*js/views/view.js*
{% highlight javascript %}
    renderRake: function() {
        // http://stackoverflow.com/questions/4886632/what-does-var-that-this-mean-in-javascript
        var that = this;

        // create the rake shape
        var rakeShape = new createjs.Shape();
        rakeShape.graphics.beginStroke("#000").beginFill("#daa").drawRect(this.rakeOffsets.x, this.rakeOffsets.y, this.rakeOffsets.width, this.rakeOffsets.height);

        // assign a click handler
        rakeShape.on("click", function(evt) {
        // When rake is clicked a new stone is added to the collection.
        // Note that we add a stone to our collection, and expect view to reflect that.
            that.collection.add(new Stone());
        });


        // add the shape to the stage
        this.stage.addChild(rakeShape);

        // a createjs container to hold all the stones.
        // we hold all the stones in a compound display so we can
        // easily change their z-index inside the container,
        // without messing with other display objects.
        this.stoneContainer = new createjs.Container();
        this.stage.addChild(this.stoneContainer);

        // for each stone in our collection, render it.
        this.collection.each(function(item) {
            this.renderStone(item);
        }, this);

    },

{% endhighlight %}


renderRake does two things, first renders the rake shape (pink rectangle) on the canvas, and assigs a click
handler on it, second traverses the stone collection and calls renderStone on each item.
The click handler adds a new stone to the collection.

Next, let's see the renderStone function.

*js/views/view.js*
{% highlight javascript %}

    renderStone: function(model) {
        // var that = this;
        var baseView = this;

        // build the stone shape
        var stoneShape = buildStoneShape();

        // make it draggable
        // the second argument is a callback called on drop
        // we snap the target stone to the rake.
        buildDraggable(stoneShape, function(target, x, y) {
            rakeSnap(target, false);
        });

        // add the stone to the stage and update
        this.stoneContainer.addChild(stoneShape);
        this.stage.update();

        function buildStoneShape() {
             var shape = new createjs.Shape();
            shape.graphics.beginStroke("#000").beginFill("#ddd").drawRect(0, 0, baseView.rakeOffsets.stoneWidth, baseView.rakeOffsets.stoneHeight);
            return shape;
        };
     },
{% endhighlight %}

We've called *buildDraggable* function to make the stone draggable. We will see how to implement that next. But first, let's review how our backbone view works.

The *CanvasView* listens to the collection's "add" event thus when a new
stone is added, it calls the *renderStone*. *CanvasView* *render* method
renders the rake and calls *renderStone* on each stone in the
collection. The rake has a click handler, when it's clicked a new
stone model is added to the stone collection, and then *renderStone* is
called on the new stone.

Finally, the *buildDraggable* function, that actually implements the drag-drop functionality:


*js/views/view.js*

{% highlight javascript %}

    renderStone: function(model) {
           // ...

        function buildDraggable(s, end) {
            // on mouse over, change the cursor to pointer
            s.on("mouseover", function(evt) {
                evt.target.cursor = "pointer";
            });
            // on mouse down
            s.on("mousedown" , function(evt) {
                // move the stone to the top
                baseView.stoneContainer.setChildIndex(evt.target, baseView.stoneContainer.getNumChildren() - 1);
                // save the clicked position
                evt.target.ox = evt.target.x - evt.stageX;
                evt.target.oy = evt.target.y - evt.stageY;
                // update the stage
                baseView.stage.update();
            });
            // on mouse pressed moving (drag)
            s.on("pressmove", function(evt) {
                // set the x and y properties of the stone and update
                evt.target.x = evt.target.ox + evt.stageX;
                evt.target.y = evt.target.oy + evt.stageY;
                baseView.stage.update();
            });

            // on mouse released call the end callback if there is one.
            s.on("pressup", function(evt) {
                if (end) {
                    end(evt.target, evt.stageX + evt.target.ox, evt.stageY + evt.target.oy);
                }
            });
        };

        // ...
    },
{% endhighlight %}

And for the constraint for snapping the stone to the rake, here's the final utility functions we need.

{% highlight javascript%}

   // drag the stone, either by animating or not
   function dragStone(s, x, y, animate) {
            if (animate) {
                // Use tween js for animation.
                createjs.Tween.get(s).to({x: x, y: y}, 100, createjs.Ease.linear);
            } else {
                // set x and y attributes without animation
                s.x = x;
                s.y = y;
            }

            // update
            baseView.stage.update();
        };

        // calculate x position to snap the rake
        function snapX(x) {
            if (x < baseView.rakeOffsets.x) x = baseView.rakeOffsets.x;
            else if (x > baseView.rakeOffsets.x + baseView.rakeOffsets.width - baseView.rakeOffsets.stoneWidth)
                x = baseView.rakeOffsets.x + baseView.rakeOffsets.width - baseView.rakeOffsets.stoneWidth;
                return x;
        };

        // calculate y position to snap the rake
        function snapY(y) {
            if (y < baseView.rakeOffsets.y) y = baseView.rakeOffsets.y;
            else if (y > baseView.rakeOffsets.y + baseView.rakeOffsets.height - baseView.rakeOffsets.stoneHeight)
                y = baseView.rakeOffsets.y + baseView.rakeOffsets.height - baseView.rakeOffsets.stoneHeight;
            return y;
        };


        // drag stone within the rake bounds. animation is disabled if second argument is given. animation is enabled by default
        function rakeSnap(s, animateDisabled) {
            dragStone(s, snapX(s.x), snapY(s.y), !animateDisabled);
        };

{% endhighlight %}

# Conclusion

In Conclusion, backbone is not restricted to html dom manipulation and
can be used anywhere that needs model view structure.  Though, it can
be used to build single page applications, it is not a complete
framework, and we have only seen one side of the backbone in this
article. If you like to use backbone for a large scale application, i
suggest using [Marionette.js](http://marionettejs.com), which handles
some primitive problems with backbone.js.
For Easeljs, it was a piece of cake to build a draggable shape.





[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/eguneys/drag-drop-sample/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

