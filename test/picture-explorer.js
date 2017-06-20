//图片浏览器，大小与源canvas一致
function hide(object,pe){
	return function (e){
		if(!object.inComponentTree(e.lastTarget)){
			if(pe.isDive() === true){
				object.setStyle({
					visible:'false',
				});
			}
		}
	};
}
function PictureExplorer(canvasDOM){
	
	
	var root = new CanvasGUI.AbsoluteLayout();
	root.setStyle({
		width:''+canvasDOM.width,
		height:''+canvasDOM.height,
		'background-color':'rgb(255,255,255)'
	});
	
	var pictureStage = new CanvasGUI.ImageView();
	pictureStage.show = function(ImageSrc){
		var self = this;
		
		if(typeof ImageSrc === 'string'){
			this.src(ImageSrc);
			this.setStyle('visible','false');
			
			function resetStyle(){
				var fullStyleName = 'width';
				var emptyStyleName = 'height';
				if(self.img.height > self.img.width){
					fullStyleName = 'height';
					emptyStyleName = 'width';
				}
				
				self.setStyle('visible','true');
				self.setStyle('margin','auto');
				self.setStyle(fullStyleName,'100%');
				self.setStyle(emptyStyleName,'');
			}
			
			this.img.onload = resetStyle;
		}
	};
	root.addChild(pictureStage);
	var diveTime = false;
	this.isDive = function(){
		return diveTime;
	};
	function dive(){
		root.setStyle('background-color','rgb(0,0,0)');
		guideArrowPrevContainer.setStyle('visible','false');
		guideArrowNextContainer.setStyle('visible','false');
		guideListContainer.setStyle('visible','false');
	}
	function explore(){
		root.setStyle('background-color','rgb(255,255,255)');
		guideArrowPrevContainer.setStyle('visible','ture');
		guideArrowNextContainer.setStyle('visible','ture');
		guideListContainer.setStyle('visible','ture');
	}
	pictureStage.addEventListener('click',function(){
		diveTime = !diveTime;
		if(diveTime){
			dive();
		}
		else{
			explore();
		}
	},false);
	
	function show(){
		this.setStyle({
			visible:'true',
		});
	}

	
	var guideArrowPrevContainer = new CanvasGUI.AbsoluteLayout();
	guideArrowPrevContainer.setStyle({
		height:'100%',
		width:'15%',
		'margin-top':'auto',
		'margin-bottom':'auto',
		left:'0',
		'background-color':'rgb(255,255,255)',
		//visible:'false',
	});
	function prev(){
		var prevIndex;
		if(guideList.checkedIndex > 0){
			prevIndex = guideList.checkedIndex - 1;
			guideList.check(prevIndex);
		}
		
	}
	guideArrowPrevContainer.addEventListener('click',prev,false);
	guideArrowPrevContainer.addEventListener('mouseover',show,false);
	guideArrowPrevContainer.addEventListener('mouseout',hide(guideArrowPrevContainer,this),false);
	var guideArrowPrev = new CanvasGUI.ImageView('test/img/arrowPrev.png');
	guideArrowPrev.setStyle({
		width:'100%',
		'margin-top':'auto',
		'margin-bottom':'auto',
		left:'0',
	});
	guideArrowPrevContainer.addChild(guideArrowPrev);
	root.addChild(guideArrowPrevContainer);
	
	var guideArrowNextContainer = new CanvasGUI.AbsoluteLayout();
	guideArrowNextContainer.setStyle({
		height:'100%',
		width:'15%',
		'margin-top':'auto',
		'margin-bottom':'auto',
		right:'0',
		'background-color':'rgb(255,255,255)'
	});
	function next(){
		var nextIndex;
		if(guideList.checkedIndex < guideList.children.length - 1){
			nextIndex = guideList.checkedIndex + 1;
			guideList.check(nextIndex);
		}
	}
	guideArrowNextContainer.addEventListener('click',next,false);
	guideArrowNextContainer.addEventListener('mouseover',show,false);
	guideArrowNextContainer.addEventListener('mouseout',hide(guideArrowNextContainer,this),false);
	var guideArrowNext = new CanvasGUI.ImageView('test/img/arrowNext.png');
	guideArrowNext.setStyle({
		width:'100%',
		'margin-top':'auto',
		'margin-bottom':'auto',
		left:'0',
	});
	guideArrowNextContainer.addChild(guideArrowNext);
	root.addChild(guideArrowNextContainer);
	
	var guideListContainer = new CanvasGUI.AbsoluteLayout();
	guideListContainer.setStyle({
		width:'100%',
		height:'25%',
		bottom:'0',
		'background-color':'rgb(255,255,255)',
	});
	function guideListContainerHide(e){
		if(!this.inComponentTree(e.lastTarget)){
			guideListContainer.setStyle({
				visible:'false',
			});
		}
	}
	guideListContainer.addEventListener('click',function(eventMsg){
		if(eventMsg.target.parent === guideList)
		{
			guideList.check(eventMsg.target.index);
		}
	},false);
	guideListContainer.addEventListener('mouseover',show,false);
	guideListContainer.addEventListener('mouseout',hide(guideListContainer,this),false);
	root.addChild(guideListContainer);
	
	var guideList = new CanvasGUI.LinearLayout('horizonal');
	guideList.checkedIndex = -1;
	guideList.setStyle({
		width:'100%',
		height:'100%',
		top:'0',
		'background-color':'rgb(255,255,255)'
	});
	guideList.addEventListener('mouseout',hide(guideListContainer,this),false);
	this.getGuideList = function(){
		return guideList;
	}
	this.getGuideListContainer = function(){
		return guideListContainer;
	}
	guideList.check = function(checkedIndex){
		self = this;
		
		var checkedColor = 'rgb(50,195,255)';
		var uncheckedColor = 'rgb(255,255,255)';
		
		var uncheckedIndex = self.checkedIndex;
		self.checkedIndex = checkedIndex;
		
		var checkedChild = self.children[checkedIndex];
		
		if(uncheckedIndex >= 0)
		{
			(function uncheck(){
				self.children[uncheckedIndex].setStyle('background-color',uncheckedColor);
			})();
		}
		
		
		checkedChild.setStyle('background-color',checkedColor);

		pictureStage.show(self.children[self.checkedIndex].src());
	};
	
	// guideList.addEventListener('click',function(eventMsg){
		// if(eventMsg.target.parent === this)
		// {
			// this.check(eventMsg.target.index);
		// }
	// },false);
	guideListContainer.addChild(guideList);
	
	
	//开启事件
	var canvasUIEvent = new CanvasGUI.Event(canvasDOM,root);
	setInterval(function(){canvasUIEvent.run();},30);
	//开启绘图
	var ctx = canvasDOM.getContext('2d');
	setInterval(function(){root.display(ctx);},30);
	//开启图片检测
	function resetLeft(){
		if(guideList.checkedIndex >= 0){
			var checkedChild = guideList.children[guideList.checkedIndex];
		
			(function reCalculateStyle(){
				var magnetX = parseInt(guideListContainer.getStyleValue('width')/2);
				var left = magnetX - (checkedChild.offsetX + checkedChild.getStyleValue('margin-left')
					+ checkedChild.getStyleValue('padding-left') 
					+ parseInt(checkedChild.getStyleValue('width') / 2));
				guideList.setStyle('left',''+left);
			})();
		}
	}
	setInterval(resetLeft,30);
}
PictureExplorer.prototype.push = function(src){//增加图片
	if(typeof src === 'string'){
		var self = this;
		function addImage(){
			var guideList = self.getGuideList();
			var listItem = new CanvasGUI.ImageView(src);
			
			if(guideList.hasChildren()){
				listItem.index = guideList.children.length;
			}
			else{
				listItem.index = 0;
			}
			
			listItem.setStyle({
				'padding-top':'10%',
				'padding-bottom':'10%',
				'margin-left':'2%',
				'margin-right':'2%',
				height:'80%',
				'background-color':'rgb(255,255,255)'
			});
			
			var guideListContainer = self.getGuideList().parent;
			listItem.addEventListener('mouseout',hide(guideListContainer,self),false);
			
			guideList.addChild(listItem);
			if(guideList.checkedIndex === -1){
				guideList.check(0);
			}
		}
		
		var img = new Image();
		img.src = src;
		img.onload = addImage;
	}
}
PictureExplorer.prototype.check = function(index){
	this.getGuideList().check(index);
}