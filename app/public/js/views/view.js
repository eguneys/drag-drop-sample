var CanvasView = Backbone.View.extend({
    initialize: function(args) {
	this.stage = args.stage;
	this.stage.enableMouseOver(20);

	this.collection = new StoneCollection();

	this.rakeOffsets = {
	    x: 10,
	    y: 400,
	    height: 150,
	    width: 300,
	    stoneWidth: 50,
	    stoneHeight: 50
	};
	
	this.listenTo(this.collection, "add", this.renderStone, this);
	this.listenTo(this.collection, "remove", this.renderRake, this);
	this.listenTo(this.collection, "reset", this.renderRake, this);
    },

    render: function() {
	this.renderRake();

	this.stage.update();

	createjs.Ticker.addEventListener("tick", this.stage);
	createjs.Ticker.setInterval(25);
	createjs.Ticker.setFPS(60);
    },


    renderRake: function() {
	var that = this;

	var rakeShape = new createjs.Shape();
	
	rakeShape.graphics.beginStroke("#000").beginFill("#daa").drawRect(this.rakeOffsets.x, this.rakeOffsets.y, this.rakeOffsets.width, this.rakeOffsets.height);
	
	rakeShape.on("click", function(evt) {
	    that.collection.add(new Stone());
	});
	
	this.stage.addChild(rakeShape);

	this.stoneContainer = new createjs.Container();
	
	this.stage.addChild(this.stoneContainer);

	this.collection.each(function(item) {
	    this.renderStone(item);
	}, this);
	
    },

    renderStone: function(model) {
	var baseView = this;
	
	var stoneShape = buildStoneShape();

	buildDraggable(stoneShape, function(target, x, y) {
	    rakeSnap(target, false);
	});

	this.stoneContainer.addChild(stoneShape);

	this.stage.update();

	function buildStoneShape() {
	     var shape = new createjs.Shape();
	    shape.graphics.beginStroke("#000").beginFill("#ddd").drawRect(0, 0, baseView.rakeOffsets.stoneWidth, baseView.rakeOffsets.stoneHeight);
	    return shape;
	};

	function buildDraggable(s, end) {
	    s.on("mouseover", function(evt) {
		evt.target.cursor = "pointer";
	    });
	    
	    s.on("mousedown" , function(evt) {
		baseView.stoneContainer.setChildIndex(evt.target, baseView.stoneContainer.getNumChildren() - 1);
		evt.target.ox = evt.target.x - evt.stageX;
		evt.target.oy = evt.target.y - evt.stageY;
		baseView.stage.update();
	    });

	    s.on("pressmove", function(evt) {
		evt.target.x = evt.target.ox + evt.stageX;
		evt.target.y = evt.target.oy + evt.stageY;
		baseView.stage.update();
	    });

	    s.on("pressup", function(evt) {
		if (end) {
		    end(evt.target, evt.stageX + evt.target.ox, evt.stageY + evt.target.oy);
		}
	    });
	};




	function dragStone(s, x, y, animate) {
	    if (animate) {
		createjs.Tween.get(s).to({x: x, y: y}, 100, createjs.Ease.linear);
	    } else {
		s.x = x;
		s.y = y;
	    }

	    baseView.stage.update();
	};
	
	
	function snapX(x) {
	    if (x < baseView.rakeOffsets.x) x = baseView.rakeOffsets.x;
	    else if (x > baseView.rakeOffsets.x + baseView.rakeOffsets.width - baseView.rakeOffsets.stoneWidth) 
		x = baseView.rakeOffsets.x + baseView.rakeOffsets.width - baseView.rakeOffsets.stoneWidth;
		return x;
	};

	function snapY(y) {
	    if (y < baseView.rakeOffsets.y) y = baseView.rakeOffsets.y;
	    else if (y > baseView.rakeOffsets.y + baseView.rakeOffsets.height - baseView.rakeOffsets.stoneHeight)
		y = baseView.rakeOffsets.y + baseView.rakeOffsets.height - baseView.rakeOffsets.stoneHeight;
	    return y;
	};

	
	
	function rakeSnap(s, animateDisabled) {
	    dragStone(s, snapX(s.x), snapY(s.y), !animateDisabled);
	};

	
    }

    
});
