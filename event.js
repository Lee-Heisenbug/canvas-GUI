if(!CanvasGUI){
	var CanvasGUI = {};
}
//Event
CanvasGUI.Event = function(eventSrcDOM,eventTgtComponent){
	this.eventSrcDOM = eventSrcDOM;
	this.eventTgtComponent = eventTgtComponent;
	
	this.rules = {executeThreshold:20,clickThreshold:10,doubleclickThreshold:20};
	this.record = {};
	this.record.mouse = {lastMouseupdown:this.rules.clickThreshold,lastClick:this.rules.doubleclickThreshold,lastMouseup:true};
	this.record.lastTarget = null;
	
	this.RTE = new CanvasGUI.Event.RealTimeEvent(eventSrcDOM);
	this.rate = 20;
//----------------------------testcode
	this.show = function(){
		console.log('down:'+this.RTE.mouse.state.mousedown+',up:'+this.RTE.mouse.state.mouseup);
	}
}

//事件信息类，存储发生的事件的信息，以及记录实时信息，以供组件的事件监听函数使用
CanvasGUI.Event.EventMsg = function(RTE){
	this.realTimeEvent = RTE;
	this.target = undefined;
	this.lastTarget = undefined;
	this.mouse = {};
	this.mouse.x = RTE.mouse.x;
	this.mouse.y = RTE.mouse.y;
	this.mouse.state = {click:false,doubleclick:false};
	this.eventType = {};
	this.eventType.mouse = {down:false,up:false,hold:false,click:false,doubleclick:false,mouseout:false};
	this.stopPropagation = false;
	for(var i in RTE.mouse.state){
		this.mouse.state[i] = RTE.mouse.state[i];
	}
}
CanvasGUI.Event.EventMsg.prototype.getRTE = function(){
	return this.realTimeEvent;
};
CanvasGUI.Event.EventMsg.prototype.setClick = function(value){
	this.eventType.mouse.click = value;
};
CanvasGUI.Event.EventMsg.prototype.setDoubleclick = function(value){
	this.eventType.mouse.doubleclick = value;
};
CanvasGUI.Event.EventMsg.prototype.getEventType = function(equipment,type){
	return this.eventType[equipment][type];
}
CanvasGUI.Event.EventMsg.prototype.setEventType = function(equipment,type){
	this.eventType[equipment][type] = true;
}


CanvasGUI.Event.RealTimeEvent = function(eventSrcDOM){
	this.mouse = {
	x:0,y:0,
	state:{mousedown:false,mouseup:true},
	};
	
	var self = this;
	
	getXY = function(e){
		var objTop = self.getOffsetTop(this);//对象y位置
		var objLeft = self.getOffsetLeft(this);//对象x位置
		var mouseX = e.clientX+document.body.scrollLeft;//鼠标x位置
		var mouseY = e.clientY+document.body.scrollTop;//鼠标y位置
		//计算点击的相对位置
		var width_setValue = parseInt(eventSrcDOM.getAttribute('width'));
		var height_setValue = parseInt(eventSrcDOM.getAttribute('height'));
		if(!width_setValue){
			width_setValue = 300;
		}
		if(!height_setValue){
			height_setValue = 150;
		}
		
		eventSrcDOMCS = getComputedStyle(eventSrcDOM);
		self.mouse.x = parseInt((mouseX-objLeft) / parseInt(eventSrcDOMCS['width']) * width_setValue);
		self.mouse.y = parseInt((mouseY-objTop) / parseInt(eventSrcDOMCS['height']) * height_setValue);
		
		self.show();
	}

	getmousedown = function(e){
		self.mouse.state.mousedown = true;
		self.mouse.state.mouseup = false;
		//test
		self.show();
	}
	
	getmouseup = function(e){
		self.mouse.state.mouseup = true;
		self.mouse.state.mousedown = false;
		//test
		self.show();
	}
	
	
	eventSrcDOM.addEventListener('mousemove',getXY,false);
	eventSrcDOM.addEventListener('mousedown',getXY,false);
	eventSrcDOM.addEventListener('mousedown',getmousedown,false);
	eventSrcDOM.addEventListener('mouseup',getXY,false);
	eventSrcDOM.addEventListener('mouseup',getmouseup,false);
}
CanvasGUI.Event.RealTimeEvent.prototype.getOffsetTop = function(obj){
	var tmp = obj.offsetTop;
	var val = obj.offsetParent;
	while(val != null)
	{
		tmp += val.offsetTop;
		val = val.offsetParent;
	}
	var cs = window.getComputedStyle(obj)
	tmp += (parseInt(cs['borderTopWidth']) + parseInt(cs['paddingTop']));
	return tmp;
}
CanvasGUI.Event.RealTimeEvent.prototype.getOffsetLeft = function(obj){
	var tmp = obj.offsetLeft;
	var val = obj.offsetParent;
	while(val != null)
	{
		tmp += val.offsetLeft;
		val = val.offsetParent;
	}
	var cs = window.getComputedStyle(obj)
	tmp += (parseInt(cs['borderLeftWidth']) + parseInt(cs['paddingLeft']));
	return tmp;
}
CanvasGUI.Event.RealTimeEvent.prototype.getMouseup = function(){
	return this.mouse.state.mouseup;
};
CanvasGUI.Event.RealTimeEvent.prototype.getMousedown = function(){
	return this.mouse.state.mousedown;
};
CanvasGUI.Event.RealTimeEvent.prototype.getX = function(){
	return this.mouse.x;
};
CanvasGUI.Event.RealTimeEvent.prototype.getY = function(){
	return this.mouse.y;
};
CanvasGUI.Event.RealTimeEvent.prototype.show = function(){
	console.log('X:'+this.mouse.x,',Y:'+this.mouse.y);
	console.log('down:'+this.mouse.state.mousedown+',up:'+this.mouse.state.mouseup);
}

CanvasGUI.Event.prototype.start = function(){
}
CanvasGUI.Event.prototype.run = function(){
//---收集事件信息
	var eventMsg = this.collect();
	
	//console.log(eventMsg);
//---处理事件信息
	this.proceed(eventMsg);
}
CanvasGUI.Event.prototype.getLastMouseupdown = function(){
	return this.record.mouse.lastMouseupdown;
};
CanvasGUI.Event.prototype.getLastClick = function(){
	return this.record.mouse.lastClick;
};
CanvasGUI.Event.prototype.getClickThreshold = function(){
	return this.rules.clickThreshold;
};
CanvasGUI.Event.prototype.getDoubleclickThreshold = function(){
	return this.rules.doubleclickThreshold;
};
CanvasGUI.Event.prototype.plusLastMouseupdown = function(){
	++this.record.mouse.lastMouseupdown;
};
CanvasGUI.Event.prototype.plusLastClick = function(){
	++this.record.mouse.lastClick;
};
CanvasGUI.Event.prototype.fullsetLastMouseupdown = function(){
	this.record.mouse.lastMouseupdown = this.rules.clickThreshold;
};
CanvasGUI.Event.prototype.fullsetLastClick = function(){
	this.record.mouse.lastClick = this.rules.DoubleclickThreshold;
};
CanvasGUI.Event.prototype.resetLastClick = function(){
	this.record.mouse.lastClick = 0;
};
CanvasGUI.Event.prototype.resetLastMouseupdown = function(){
	this.record.mouse.lastMouseupdown = 0;
};
CanvasGUI.Event.prototype.getRTE = function(){
	return this.RTE;
};
CanvasGUI.Event.prototype.getLastTarget = function(){
	return this.record.lastTarget;
};
CanvasGUI.Event.prototype.setLastTarget = function(lastTarget){
	this.record.lastTarget = lastTarget;
};

CanvasGUI.Event.prototype.collect = function(){
//---先创建一个eventMsg
	var eventMsg = new CanvasGUI.Event.EventMsg(this.getRTE());
	eventMsg.target = this.getTarget(this.eventTgtComponent,eventMsg);
	
//---判断事件类型过程
	//每次运行需要增加实时事件中上一次鼠标点下的时间
	if(this.getLastMouseupdown() < this.getClickThreshold()){
		this.plusLastMouseupdown();
	}
	//每次运行需要增加实时事件中上一次鼠标单击的时间
	if(this.getLastClick() < this.getDoubleclickThreshold()){
		this.plusLastClick();
	}
	
	//---设置
	
	//----判断单击和双击
	//如果实时事件中，鼠标的状态是抬起，需要判断此时是否形成单击事件类型
	if(this.getRTE().getMouseup())
	{
		if(!this.lastMouseup){//如果上次的鼠标状态是按下，则造成上电平
			//如果上次鼠标按下的事件小于单击阈值，则造成单击
			if(this.getLastMouseupdown() < this.getClickThreshold())
			{
				console.log('click!');
				eventMsg.setEventType('mouse','click');//设置事件信息对象的鼠标状态
				this.fullsetLastMouseupdown();// = this.rules.clickThreshold;
				
				//鼠标造成单击，还需要判断是否造成双击
				if(this.getLastClick() < this.getDoubleclickThreshold())
				{
					console.log('doubleclick!');
					eventMsg.setEventType('mouse','doubleclick');
					this.fullsetLastClick();// = this.rules.doubleclickThreshold;
				}
				else//如果不造成双击，就是说此次单击是第一次单击，把this.record.mouse.lastClick设置为0;
				{
					//eventMsg.setDoubleclick(false);/* this.mouse.state.doubleclick = */
					this.resetLastClick();// = 0;
				}
			}
			else//否则不造成单击
			{
				//eventMsg.setClick(false);/* this.mouse.state.click = */ //false;
				//eventMsg.setDoubleclick(false);/* this.mouse.state.doubleclick = */ //false;
			}
		}
	}
	else if(this.getRTE().getMousedown())//如果实时事件中，鼠标的状态是按下的，则lastMouseupdown置0
	{
		if(this.lastMouseup){//如果上次的鼠标状态是抬起，则产生下电平
			this.resetLastMouseupdown();
		}
	}
	
	this.lastMouseup = this.getRTE().getMouseup();
	
	//----判断mouseout
	var lastTarget = this.getLastTarget();
	var temp = eventMsg.target;
	if(lastTarget){
		
		if(lastTarget !== eventMsg.target){//如果上次的目标与此次目标不一致
			eventMsg.target = lastTarget;
			eventMsg.lastTarget = temp;
			eventMsg.setEventType('mouse','mouseout');
		}
	}
	this.setLastTarget(temp);
	
	return eventMsg;
}

CanvasGUI.Event.prototype.proceed = function(eventMsg){
	var componentNode = this.eventTgtComponent;

	componentNode = eventMsg.target;

	
	//进行冒泡传递事件并处理
	if(eventMsg.target){
		do
		{
			//先执行最底层的子组件的事件监听函数
			if(eventMsg.stopPropagation === false){
			//stopPropagation如果被事件回调函数被设置为false，即此事件没有被阻止冒泡的话
				this.execute(componentNode,eventMsg,true);
			}
			var temp = this.distribute(componentNode,eventMsg,true);
			if(temp === undefined)//如果找不到
			{
				break;
			}
			else
			{
				componentNode = temp;
			}
		}while(true);
	}
}

CanvasGUI.Event.prototype.execute = function(componentNode,eventMsg,bubbling){
	function handle(componentNode,eventHandler)
	{
		if(eventHandler){//如果有与事件相关的监听器则执行
			for(var i = 0;i < eventHandler.length;++i){//执行与事件相关的所有监听器
				if(eventHandler[i]){
					if(eventHandler[i].bubbling === bubbling){
						eventHandler[i].func.apply(componentNode,[eventMsg]);
					}
				}
			}
		}
	}
	
	//根据eventMsg的事件状态执行组件的事件监听函数
	if(eventMsg.getEventType('mouse','mouseout')){//假如发生鼠标移出目标
		handle(componentNode,componentNode.onmouseout);
	}
	else{
		if(true){//发生鼠标在组件上
			handle(componentNode,componentNode.onmouseover);
		}
		if(eventMsg.getEventType('mouse','mouseup')){//发生鼠标抬起
		}
		if(eventMsg.getEventType('mouse','mousedown')){//发生鼠标按下
			handle(componentNode,componentNode.onmousedown);
		}
		if(eventMsg.getEventType('mouse','click')){//发生鼠标单击
			handle(componentNode,componentNode.onclick);
		}
		if(eventMsg.getEventType('mouse','doubleclick')){//发生鼠标双击
			handle(componentNode,componentNode.ondblclick);
		}
	}
}
CanvasGUI.Event.prototype.getTarget = function(componentNode,eventMsg){
	var tempTarget = undefined;
	if(componentNode.hasChildren()){//如果有子组件，先检查子组件
		for(var i = componentNode.children.length - 1;i >= 0;--i){
			//从数组的尾部开始遍历（因为标记较小的在底层）
			tempTarget = this.getTarget(componentNode.children[i],eventMsg);
			if(tempTarget){
				return tempTarget;
			}
		}
	}
	if(tempTarget === undefined){//如果没有子组件或者子组件中未被点击，则检查此组件是否被点击
		if(componentNode.include(eventMsg.mouse.x,eventMsg.mouse.y)){//如果此组件被点击
			return componentNode;
		}
		else{//如果未被点击则返回undefined
			return undefined;
		}
	}
	
};

CanvasGUI.Event.prototype.distribute = function(componentNode,eventMsg,bubbling){
	//冒泡查找
	if(componentNode.hasParent()){
		return componentNode.parent;
	}
	else{
		return undefined;//返回一个组件，如果找不到组件则返回undefined；
	}
}
