if(!CanvasGUI){
	var CanvasGUI = {};
}

//Visible
CanvasGUI.Visible = function(){}
CanvasGUI.Visible.prototype.display = function (){};

//Component
CanvasGUI.Component = function(){
	//basic
	CanvasGUI.Visible.apply(this);
	this.children = null;
	this.parent = null;
	
	//style
	this.styleText = '';
	this.style = {};
	this.styleValue = {};
	
	//display
	this.ABSX = 0;
	this.ABSY = 0;
	this.paddingABSX = 0;
	this.paddingABSY = 0;
	this.contentABSX = 0;
	this.contentABSY = 0;
	this.offsetX = 0;
	this.offsetY = 0;
}

extend(CanvasGUI.Component,CanvasGUI.Visible);

(function basic(Component){
	Component.prototype.addChild = function(childComponent){
		if(this.children === null)
		{
			this.children = [];
		}
		this.children[this.children.length] = childComponent;
		childComponent.parent = this;
	}

	Component.prototype.hasChildren = function(){
		if(this.children)
		{
			for(var i = 0;i < this.children.length;++i)
			{
				if(this.children[i])
				{
					return true;
				}
			}
		}
		return false;
	}
	Component.prototype.hasParent = function(){
		if(this.parent)
		{
			return true;
		}
		else
		{
			return false;
		}
	};
	Component.prototype.inComponentTree = function(treeNode){
	var target_temp = treeNode;//target_temp作为目标的中间值来进行遍历目标树
	
	while(target_temp){//如果target_temp存在则进行判断component是否在目标树中
		if(target_temp === this){//如果相等则存在，返回true
			return true;
		}
		target_temp = target_temp.parent;
	}
	
	return false;//如果跳出循环，则说明树已经遍历完成，并且没找到与component相等的目标，则component不存在与目标树。
};
})(CanvasGUI.Component);

(function eventRelatic(Component){

	//EventListener
	function EventListener(func,spreading){
		this.func = func;
		this.bubbling = !spreading;
	}
	Component.prototype.include = function(x,y){
		if(this.getStyleValue('display') === true){
			if(x >= this.paddingABSX && x <= this.paddingABSX + this.styleValue.width){
				if(y >= this.paddingABSY && y <= this.paddingABSY + this.styleValue.height){
					return true;
				}
			}
		}
		return false;
	}
	Component.prototype.addEventListener = function(type,func,spreading){
		type = 'on'+type;
		if(!this[type]){
			this[type] = [];
		}
		this[type].push(new EventListener(func,spreading));
	}

})(CanvasGUI.Component);

(function styleRelatic(Component){
	Component.prototype.customizedSetDefaultStyleValue = undefined;
	Component.prototype.customizedValuateStyle = undefined;
	Component.prototype.setDefaultStyleValue = function(){
		this.styleValue.display = true;
		this.styleValue.visible = true;
		
		this.styleValue.width = 0;
		this.styleValue.height = 0;
		
		this.styleValue['padding-top'] = 0;
		this.styleValue['padding-right'] = 0;
		this.styleValue['padding-bottom'] = 0;
		this.styleValue['padding-left'] = 0;
		
		this.styleValue['margin-top'] = 0;
		this.styleValue['margin-right'] = 0;
		this.styleValue['margin-bottom'] = 0;
		this.styleValue['margin-left'] = 0;
		
		this.styleValue['background-color'] = 'rgb(255,255,255)';
		
		this.styleValue.position = 'absolute';
		this.styleValue.top = 0;
		this.styleValue.left = 0;
		
		//设置自定义默认值
		if(this.customizedSetDefaultStyleValue){
			this.customizedSetDefaultStyleValue();
		}
	};
	Component.prototype.setStyleTest = function(styleTest){
		//把每一项用';'分开
		var styleTestItems = styleTest.split(';');
		var styleName = 0;
		var styleValue = 1;
		
		//需要错误处理
		for(var i = 0;i < styleTestItems.length;++i){
			//把一项中的样式名称与值用':'分开
			var styleTestItem = styleTestItems[i].split(':');
			//如果涉及到特殊的值('margin'与'padding')
			if(['margin','padding'].indexOf(styleTestItem[i][styleName]) >= 0){
				var directions = ['top','right','bottom','left'];
				this.setStyle(styleTestItem[styleName],styleTestItem[styleValue]);
				for(j = 0;j < directions.length;++j){//设置四个方向上的值
					this.setStyle(styleTestItem[styleName]+'-'+directions[j],styleTestItem[styleValue]);
				}
			}
			else{
				this.setStyle(styleTestItem[styleName],styleTestItem[styleValue]);
			}
		}
	};
	Component.prototype.getStyle = function(styleName){
		if(typeof styleName === 'string'){
			if(this.style[styleName] === undefined){
				return '';
			}
			else{
				return this.style[styleName];
			}
		}
		else{
			return this.style;
		}
	};
	Component.prototype.setStyle = function(){
		if(typeof arguments[0] === 'object'){
			var style = arguments[0];
			for(var i in style)
			{
				this.style[i] = style[i];
			}
		}
		else if(typeof arguments[0] === 'string'){
			if(typeof arguments[1] === 'string'){
				this.style[arguments[0]] = arguments[1];
			}
		}
	}
	
	Component.prototype.getStyleValue = function(styleName){
		return this.styleValue[styleName];
	}
	Component.prototype.setStyleValue = function(styleName,value){
		this.styleValue[styleName] = value;
	}
	Component.prototype.valuateStyle = function(){
		//设置默认样式
		this.setDefaultStyleValue();
	
		var tempValue;
		//---设置display
		tempValue = this.getStyle('display');
		if(tempValue === 'false'){
			this.styleValue.display = false;
		}
		
		//---设置visible
		tempValue = this.getStyle('visible');
		if(tempValue === ''){
			if(this.hasParent()){
				this.styleValue.visible = this.parent.getStyleValue('visible');
			}
		}
		else{
			if(tempValue === 'false'){
				this.styleValue.visible = false;
			}
		}
		
		//计算框模型函数
		var frameStyleNames = ['width','height','padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-right','margin-bottom','margin-left'];
		
		for(var i = 0;i < frameStyleNames.length;++i){
			this.calculateFrame(this,frameStyleNames[i]);
		}
		
		//---设置background-color
		tempValue = this.getStyle('background-color');
		if(tempValue !== ''){
			this.styleValue['background-color'] = tempValue;
		}
		
		//自定义计算样式值
		if(this.customizedValuateStyle){
			this.customizedValuateStyle();
		}
		
		//协调样式(解决样式冲突与计算auto)
		this.calculateAutoValue(this,'vertical');
		this.calculateAutoValue(this,'horizonal');

	};
	Component.prototype.calculateFrame = function(self,styleName,defaultValue){
		var styleString;
		
		if(styleName.indexOf('padding') >= 0){//如果styleName的前缀是padding
			styleString = self.getStyle('padding');
			if(self.getStyle(styleName) !== ''){
				styleString = self.getStyle(styleName);
			}	
		}
		else if(styleName.indexOf('margin') >= 0){//如果styleName的前缀是margin
			styleString = self.getStyle('margin');
			if(self.getStyle(styleName) !== ''){
				styleString = self.getStyle(styleName);
			}	
		}
		else{
			styleString = self.getStyle(styleName);
		}
		
		var styleNumeral = parseInt(styleString);
		var defaultValue = self.styleValue[styleName];
		var result;
		
		if(styleString === ''){
			//结果为0
			result = defaultValue;
		}
		else if(!isNaN(styleNumeral)){
			//如果样式值可以解析为数值，需要确认样式值中是否有百分号
			if(styleString.indexOf('%') > 0){
				//如果有百分号需要判断属性的方向性来计算结果的百分比结果，然后返回
				
				//由于百分比的计算与父组件有关，所以要先检查本组件是否有父组件
				if(self.hasParent()){
					//如果有父组件，根据属性所属的方向计算出数值
					
					var WOH;
					var postFix = styleName.split('-');
					postFix = postFix[postFix.length-1];
					//根据styleName计算出WOH
					if(['top','height','bottom'].indexOf(postFix) >= 0){
						WOH = 'height';
					}
					else{
						WOH = 'width';
					}
					result =  parseInt(styleNumeral/100*self.parent.getStyleValue(WOH));
				}
				else{
					//如果没有父组件，返回0
					result =  0;
				}
			}
			else{
				//如果不是百分比，直接计算结果然后返回
				result =  styleNumeral;
			}
		}
		else{
			//如果样式值是字符串
			
			if(styleName.indexOf('padding') >= 0){
			//如果样式值是字符串，而且是padding相关的属性，则返回0。
				result =  0;
			}
			else{
				//如果属性不是padding，则可能有'auto'值，需要特别处理，然后返回
				if(styleString === 'auto'){
					//如果是'auto'值，则返回'auto'
					result =  styleString;
				}
				else{
					//如果不是'auto'，返回0
					result = 0;
				}
			}
		}
		
		self.styleValue[styleName] = result;
	};
	Component.prototype.calculateAutoValue = function(self,direction){
	
		if(direction === 'vertical'){
			styleNames = ['margin-top','padding-top','height','padding-bottom','margin-bottom'];
		}
		else{
			styleNames = ['margin-left','padding-left','width','padding-right','margin-right'];
		}
		
		var margins,paddings,center,parentValue;
		margins = [self.getStyleValue(styleNames[0]),self.getStyleValue(styleNames[4])]
		paddings = [self.getStyleValue(styleNames[1]),self.getStyleValue(styleNames[3])]
		center = self.getStyleValue(styleNames[2]);
		
		var result = {margins:[margins[0],margins[1]],center:center};
		
		var autoCounts = 0;
		for(var i = 0;i < 2;++i){
			if(margins[i] === 'auto'){
				++autoCounts;
			}
		}
		if(center === 'auto'){
			++autoCounts;
		}
		
		if(self.hasParent()){
			var parentValue = self.parent.getStyleValue(styleNames[2]);
			
			if(autoCounts === 1){
				if(margins[0] === 'auto'){
					result.margins[0] = parentValue - (paddings[0]+center+paddings[1]+margins[1]);
				}
				else if(margins[1] === 'auto'){
					result.margins[1] = parentValue - (margins[0]+paddings[0]+center+paddings[1]);
				}
				else if(center === 'auto'){
					result.center = parentValue - (margins[0]+paddings[0]+paddings[1]+margins[1]);
				}
			}
			else if(autoCounts === 2){
				if(center !== 'auto'){
					result.margins[0] = result.margins[1] = parseInt((parentValue - (paddings[0]+center+paddings[1]))/2);
				}
				else if(margins[0] === 'auto'){
					result.margins[0] = 0;
					result.center = parentValue - (result.margins[0]+paddings[0]+paddings[1]+margins[1]);
				}
				else{
					result.margins[1] = 0;
					result.center = parentValue - (margins[0]+paddings[0]+paddings[1]+result.margins[1]);
				}
			}
			else if(autoCounts === 3){
				result.margins[0] = result.margins[1] = 0;
				result.center = parentValue - (result.margins[0]+paddings[0]+paddings[1]+result.margins[1]);
			}
		}
		else{
			if(result.margins[0] === 'auto'){
				result.margins[0] = 0;
			}
			if(result.margins[1] === 'auto'){
				result.margins[1] = 0;
			}
			if(result.center === 'auto'){
				result.center = 0;
			}
		}
		
		self.styleValue[styleNames[0]] = result.margins[0];
		self.styleValue[styleNames[4]] = result.margins[1];
		self.styleValue[styleNames[2]] = result.center;
	};

})(CanvasGUI.Component);

(function displayRelatic(Component){
	Component.prototype.display = function(ctx){
		ctx.save();
	
		//如果没有父组件则计算本组件的样式（由于父组件负责计算本组件在父组件的偏移量中需要获取本组件的框模型信息，所以如果有父组件就不再重复此步骤了）
		if(!this.hasParent()){
			this.valuateStyle();
		}
		if(this.getStyleValue('display'))//如果display属性为true,才显示
		{
			//注意!!!!!!!!!!!!!!!!!!!!!!!!!!!以下函数顺序不可轻易调换
			//计算本组件的绝对位置
			this.setABSXY();
			
			//计算本组件的padding,和内容的大小
			this.setPaintArea();
			
			//画内容
			if(this.getStyleValue('visible')){
				//---画内边距padding
				this.setPaddingABSXY();
				this.paintPadding(ctx);
				this.setContentABSXY();
				this.paintContent(ctx);
			}
			
			//画子组件
			if(this.hasChildren()){
				for(var i = 0;i < this.children.length;++i){
					this.children[i].valuateStyle();
				}
				this.setChildrenOffsetXY();
				this.paintChildren(ctx);
			}
		}
		
		ctx.restore();
	};
	Component.prototype.paintPadding = function(ctx){
		
		ctx.fillStyle = this.getStyleValue('background-color');
		ctx.fillRect(this.paddingABSX,this.paddingABSY,this.paddingWidth,this.paddingHeight);
	};
	Component.prototype.paintContent = function(ctx){
		
	};
	Component.prototype.paintChildren = function(ctx){
		ctx.save();
		
		if(this.hasChildren()){
			for(var i = 0;i < this.children.length;++i){
				this.children[i].display(ctx);
			}
		}
		
		ctx.restore();
	};
	Component.prototype.setChildrenOffsetXY = function(){};
	Component.prototype.setPaintArea = function(){
		this.setContentArea();
		this.setPaddingArea();
	}
	Component.prototype.setContentArea = function(){
		//contentWidth = style.width,contentHeight = style.height
		this.contentWidth = this.getStyleValue('width');
		this.contentHeight = this.getStyleValue('height');

	};
	Component.prototype.setPaddingArea = function(){
		this.paddingWidth = this.contentWidth + this.getStyleValue('padding-left') + this.getStyleValue('padding-right');
		
		this.paddingHeight = this.contentHeight + this.getStyleValue('padding-top') + this.getStyleValue('padding-bottom');
		
	};
	Component.prototype.setABSXY = function(ABSX,ABSY){
		this.ABSX = this.offsetX;
		this.ABSY = this.offsetY;
		
		if(this.hasParent()){
			this.ABSX += this.parent.contentABSX;
			this.ABSY += this.parent.contentABSY;
		}
	};
	Component.prototype.setPaddingABSXY = function(ABSX,ABSY){
		this.paddingABSX = this.getABSX()+this.getStyleValue('margin-left');
		this.paddingABSY = this.getABSY()+this.getStyleValue('margin-top');
	};
	Component.prototype.setContentABSXY = function(ABSX,ABSY){
		this.contentABSX = this.paddingABSX+this.getStyleValue('padding-left');
		this.contentABSY = this.paddingABSY+this.getStyleValue('padding-top');
	};
	Component.prototype.getABSX = function(){
		return this.ABSX;
	};
	Component.prototype.getABSY = function(){
		return this.ABSY;
	};
})(CanvasGUI.Component);

//AbsoluteLayout
CanvasGUI.AbsoluteLayout = function(){
	CanvasGUI.Component.apply(this);
}
extend(CanvasGUI.AbsoluteLayout,CanvasGUI.Component);
CanvasGUI.AbsoluteLayout.prototype.paintContent = function(ctx){
};
CanvasGUI.AbsoluteLayout.prototype.setChildrenOffsetXY = function(){
	if(this.hasChildren()){
		var child;
		for(var i = 0;i < this.children.length;++i){
			child = this.children[i];
			child.valuateStyle();
			
			function calculateOffsetXY(self,child,direction){
				var offset;
				var sides = [];
				var length;
				var selfLength;
				if(direction === 'horizonal'){
					sides[0] = child.getStyle('left');
					sides[1] = child.getStyle('right');
					length = child.getStyleValue('margin-left')
						+child.getStyleValue('padding-left')
						+child.getStyleValue('width')
						+child.getStyleValue('padding-right')
						+child.getStyleValue('margin-right');
					selfLength = self.getStyleValue('width');
				}
				else if(direction === 'vertical'){
					sides[0] = child.getStyle('top');
					sides[1] = child.getStyle('bottom');
					length = child.getStyleValue('margin-top')
						+child.getStyleValue('padding-top')
						+child.getStyleValue('height')
						+child.getStyleValue('padding-bottom')
						+child.getStyleValue('margin-bottom');
					selfLength = self.getStyleValue('height');
				}
				
				if(sides[0] !== ''){//如果0偏移值合法则用0值计算
					offset = parseInt(sides[0]);
				}
				else if(sides[1] !== ''){//如果0偏移值不合法而1偏移值合法则用1值计算
					offset = selfLength - (parseInt(sides[1]) + length);
				}
				else{//如果0,1两个偏移值都不合法则偏移值为零
					offset = 0;
				}
				return offset;
			}
			
			child.offsetX = calculateOffsetXY(this,child,'horizonal');
			child.offsetY = calculateOffsetXY(this,child,'vertical');
		}
	}
};

//LinearLayout
CanvasGUI.LinearLayout = function(direction){
	CanvasGUI.Component.apply(this);
	this.direction = direction;
}
extend(CanvasGUI.LinearLayout,CanvasGUI.Component);
CanvasGUI.LinearLayout.prototype.paintContent = function(ctx){
};
CanvasGUI.LinearLayout.prototype.setChildrenOffsetXY = function(){
	if(this.hasChildren()){
		var stylePostfix;
		var offsetName;
		
		if(this.getDirection() === 'horizonal'){
			stylePostfix = ['left','width','right'];
			offsetName = 'offsetX';
		}
		else{
			stylePostfix = ['top','height','bottom'];
			offsetName = 'offsetY';
		}
		
		styleNames = ['margin-'+stylePostfix[0],'padding-'+stylePostfix[0],stylePostfix[1],'padding-'+stylePostfix[2],'margin-'+stylePostfix[2]];
		
		var tempOffset = 0;
		var preLastMargin = 0;
		var currentFirstMargin;
		var i = 0;
		do{
			currentFirstMargin = this.children[i].getStyleValue(styleNames[0]);
			
			if(currentFirstMargin > preLastMargin){
				tempOffset -= preLastMargin;
			}
			else{
				tempOffset -= currentFirstMargin;
			}
			
			this.children[i][offsetName] = tempOffset;
			
			for(var j = 0;j < styleNames.length;++j){
				tempOffset += this.children[i].getStyleValue(styleNames[j]);
			}
			
			preLastMargin = this.children[i].getStyleValue(styleNames[styleNames.length-1]);
			
			++i;
		}while(this.children[i]);
	}
	
};
CanvasGUI.LinearLayout.prototype.getDirection = function(){
	return this.direction;
}

//ImageView extend Component
CanvasGUI.ImageView = function(ImageSrc){
	CanvasGUI.Component.apply(this);
	this.img = new Image();
	
	if(ImageSrc){
		this.img.src = ImageSrc;
	}
	
}
extend(CanvasGUI.ImageView,CanvasGUI.Component);
CanvasGUI.ImageView.prototype.src = function(){
	if(typeof arguments[0] === 'string'){
		this.img.src = arguments[0];
	}
	else{
		return this.img.src;
	}
}
CanvasGUI.ImageView.prototype.paintContent = function(ctx){
	ctx.drawImage(this.img,this.contentABSX,this.contentABSY,this.contentWidth,this.contentHeight);
};
CanvasGUI.ImageView.prototype.customizedSetDefaultStyleValue = function(){
	this.styleValue.width = this.img.width;
	this.styleValue.height = this.img.height;
};
CanvasGUI.ImageView.prototype.customizedValuateStyle = function(){
	//重新设置宽高默认值
	var valuatedWidth = this.styleValue.width;
	var valuatedHeight = this.styleValue.height;
	
	this.customizedSetDefaultStyleValue();
	if(this.getStyle('width') === ''){//如果width是''
		if(this.getStyle('height') !== ''){//如果width是''，而height不是''
			//则使用已经出height的值，然后按比例计算width值
			
			this.styleValue.width = valuatedHeight*this.styleValue.width/this.styleValue.height;
			this.styleValue.width = parseInt(this.styleValue.width);
			this.styleValue.height = valuatedHeight;
		}
		else{
			//使用默认值，由于上customizedSetDefaultStyleValue函数已经计算出默认值，这里就不做处理
		}
	}
	else{//如果width不是''
		if(this.getStyle('height') === ''){//如果width不是''而height是''
			//使用计算过的width值，然后按比例计算height值
			
			this.styleValue.height = valuatedWidth*this.styleValue.height/this.styleValue.width;
			this.styleValue.height = parseInt(this.styleValue.height);
			this.styleValue.width = valuatedWidth;
		}
		else{//如果两个值都不是''，则使用两个计算过的值
			this.styleValue.width = valuatedWidth;
			this.styleValue.height = valuatedHeight;
		}
	}
	
};
