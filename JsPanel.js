function JsPanel() 
{
	this.pressX = 0;
	this.pressY = 0;
	this.state = {pressed:false,resizing:false,moving:false,minimized:false,dx:0,dy:0,x:'20px',y:'20px',ht:'401px',wd:'251px'};
	this.listening = false;
	this.element = null;
	this.maindiv = null;
	this.userdiv = null;
	this.panelhead = null;
	this.title = {element:null,text:' '};
	this.themedir = 'greenback';
	this.debugout = document.getElementById('debugout');
}

JsPanel.prototype.resize = function(h,w) {
	var ht = h || this.element.clientHeight;
	var wd = w || this.element.clientWidth;
	var height = parseInt(ht);
	var width = parseInt(wd);
	ret = false;
	if ( height > 63 && width > 71 ) {
		ret = true;
		this.state.ht = height;
		this.state.wd = width;
		this.element.style.height = height + 'px';
		this.element.style.width = width + 'px';
		var divs = this.element.getElementsByTagName('div');
		for(var i=0; i<divs.length; i++) {
			switch (divs[i].className) {
				case 'JsPanel_leftmid':
				case 'JsPanel_rightmid':
					divs[i].style.height = height - 32 + 'px';
					break;
				case 'JsPanel_mid':
					divs[i].style.width = width - 36 + 'px';
					break;
				case 'JsPanel_midmain':
					divs[i].style.height = height - 10 + 'px';
					break;
			}
		}
	}
	return ret;
}

JsPanel.prototype._addEventListener = function(element, eventtype, func, capture)
{
	capture = false;
	if (element.addEventListener) {
		return element.addEventListener(eventtype, func, capture);
	} else {
		var ret = element.attachEvent('on' + eventtype,func);
		if (capture) element.setCapture();
		return ret;
	}
}

JsPanel.prototype.minimize = function()
{
	var width = parseInt(this.element.clientWidth);
	var height = this.panelhead.clientHeight + this.panelhead.offsetTop;
	this.state.minimized = true;
	this.state.width = this.element.clientWidth;
    	this.state.height = this.element.clientHeight;
	this.state.resizing = false;
	this.element.style.height = height + 'px';
	this.element.style.width = width + 'px';
	this.element.className = 'JsPanel_minimized';
}

JsPanel.prototype.maximize = function()
{
	this.state.minimized = false;
	this.resize(this.state.ht,this.state.wd);
	this.element.className = 'JsPanel_container';
}

JsPanel.prototype.moveBy = function (dx,dy)
{
	var curx = (this.element.style.left.length == 0 )?this.element.offsetLeft:this.element.style.left;
	var cury = (this.element.style.top.length == 0 )?this.element.offsetTop:this.element.style.top;
	var x = parseInt(curx) + parseInt(dx);
	var y = parseInt(cury) + parseInt(dy);
	var ret = {x:0,y:0,moved:false};
//	if (x > 0 && ((x + this.element.clientWidth) < window.innerWidth)) {
		this.state.x = x + 'px';
		this.element.style.left = this.state.x;
		ret.x = 1;
		ret.moved = true;
//	}
//	if (y > 0 && ((y + this.element.clientHeight) < window.innerHeight)) {
		this.state.y = y + 'px';
		this.element.style.top = this.state.y;
		ret.y = 1;
		ret.moved = true;
//	}
	return ret;
}

JsPanel.prototype.mousePressed = function(evnt, source)
{
	if (!evnt) { evnt = window.event; }
	var el = evnt.currentTarget || evnt.srcElement;
	if (source == "panel") {
		this.pressX = evnt.clientX;
		this.pressY = evnt.clientY;
		this.state.pressed = !this.state.pressed;
	} else if (source == "body") {
		this.state.pressed = false;
		this.element.className = this.element.className.replace(/[ ]*JsPanel_pressed[ ]*/,"");
	}
	this.element.className = this.element.className.replace(/[ ]*JsPanel_pressed[ ]*/,"");
	if (this.state.pressed) {
		this.element.className += " JsPanel_pressed";
	}
	evnt.cancelBubble = true;
	if (evnt.stopPropagation) evnt.stopPropagation(); 
	if (this.debugout) {
		var msg = evnt.type + "(" + source + ") - target:" + el.tagName + "#" + el.id + "." + el.className;
		this.debugout.innerHTML = msg;
	}
}

JsPanel.prototype.mouseReleased = function(evnt)
{
	if (!evnt) { evnt = window.event; }
	var el = evnt.currentTarget || evnt.srcElement;

	if (!this.state.resizing) {
		if (this.state.moving) {
			el.style.cursor = 'auto';
			this.state.moving = false;
		} else {
			if (this.state.pressed) {
				el.style.cursor = 'move';
				this.state.moving = true;
			}
		}
	} 
}

JsPanel.prototype.mouseMoved = function(evnt,source)
{
	if (!evnt) { evnt = window.event; }
	var el = evnt.currentTarget || evnt.srcElement;
	var sx = evnt.clientX;
     var sy = evnt.clientY;
	var x = sx - parseInt(this.state.x);
	var y = sy - parseInt(this.state.y);
	var dx = (sx - this.pressX);
	var dy = (sy - this.pressY);
	if (this.debugout) {
		var msg = "";
		for (key in this.state) {
			msg += key + ": " + this.state[key] + ", ";
		}
		msg += "<br>" + evnt.type + "(" + source + ") - target:" + el.tagName + "#" + el.id + "." + el.className;
		this.debugout.innerHTML = msg;
	}
	if (this.state.pressed) {
		if (this.state.resizing) {
			var moved = {x:1,y:1,moved:true};
			if ((this.state.resizing.match(/^n/) && dy != 0) || (this.state.resizing.match(/^w/) && dx != 0)) {
				moved = this.moveBy((this.state.dx == 0)?0:dx,(this.state.dy == 0)?0:dy);
			}
			if ( moved.moved && !this.resize(this.element.clientHeight + (dy * this.state.dy * moved.y),this.element.clientWidth + (dx * this.state.dx * moved.x))) this.moveBy((this.state.dx == 0)?0:0-dx,(this.state.dy == 0)?0:0-dy);;
		} else if (this.state.moving) {
			this.moveBy(dx,dy);
		}
	} else {
		if (source == "panel" && !this.state.minimized && !el.className.match(/JsPanel_noresize/)) {
			if (x < 10 && y < 10) {
				this.state.dx = -1;
				this.state.dy = -1;
				this.state.resizing = 'nw';
				el.style.cursor = 'nw-resize';
			} else if ( x < 10 && y > (el.clientHeight - 12)) {
				this.state.dx = -1;
				this.state.dy = 1;      
				this.state.resizing = 'sw';
				el.style.cursor = 'sw-resize';
			} else if (x > (el.clientWidth - 10) && y < 10) {
				this.state.dx = 1;
				this.state.dy = -1;     
				this.state.resizing = 'ne';
				el.style.cursor = 'ne-resize';
			} else if (x > (el.clientWidth - 10) && y > (el.clientHeight - 12)) {
				this.state.dx = 1;
				this.state.dy = 1;    
				this.state.resizing = 'se';
				el.style.cursor = 'se-resize';
			} else if (x < 6) {
				this.state.dx = -1;
				this.state.dy = 0;   
				this.state.resizing = 'w';
				el.style.cursor = 'w-resize';
			} else if (y < 6) {
				this.state.dx = 0;
				this.state.dy = -1;  
				this.state.resizing = 'n';
				el.style.cursor = 'n-resize';
			} else if (x > (el.clientWidth - 6)) {
				this.state.dx = 1;
				this.state.dy = 0; 
				this.state.resizing = 'e';
				el.style.cursor = 'e-resize';
			} else if (y > (el.clientHeight - 8)) {
				this.state.dx = 0;
				this.state.dy = 1; 
				this.state.resizing = 's';
				el.style.cursor = 's-resize';
			} else {
				this.state.resizing = false;
				el.style.cursor = 'auto';
			}
		} else {
			this.element.style.cursor = 'auto';
		}
	}
	this.pressX = sx;
	this.pressY = sy;
	evnt.cancelBubble = true;
	if (evnt.stopPropagation) evnt.stopPropagation();
}

JsPanel.prototype._addElement = function (parentel, tag, id, cssclass, attrs)
{
	var newel = document.createElement(tag);
	newel.id = id;
	if (cssclass != null) newel.className = cssclass;
	if (typeof attrs == "object") {    
		for (var key in attrs) {
			newel.setAttribute(key,attrs[key]);
		}
	}
	if (parentel && parentel.appendChild) parentel.appendChild(newel);
	return newel;
}

JsPanel.prototype.addElement = function (tag, id, cssclass, attrs)
{
	if (!this.userdiv || !this.userdiv.constructor.toString().match(/HTML([a-zA-Z0-9]*)Element/)) throw "addElement(): Build Panel first";
	return this._addElement(this.userdiv, tag, id, cssclass, attrs);
}

JsPanel.prototype.appendChild = function (newchild)
{
	return this.userdiv.appendChild(newchild);
}

JsPanel.prototype.cancelEvent = function (evnt)
{
	if (!evnt) { evnt = window.event; }
  	evnt.cancelBubble = true;
	if (evnt.stopPropagation) evnt.stopPropagation();   
}


JsPanel.prototype.buttonSwitch = function (evnt, up, cancel)
{
	if (!evnt) { evnt = window.event; }
	var el = evnt.currentTarget || evnt.srcElement;
	el.className = el.className.replace(/_down$/,"");
	if (!up) el.className = el.className + '_down';
	if (cancel) this.cancelEvent(evnt);
}

JsPanel.prototype.panelHeadButton = function (element,type,actionfunc)
{
	var newel = this._addElement(element,'button','JsPanel_' + type + 'btn','JsPanel_noresize JsPanel_' + type + 'btn',{type:'button'});
	var thisinst = this;
	this._addEventListener(newel,'mousedown',function (event) {thisinst.buttonSwitch(event,false,true)});
	this._addEventListener(newel,'mouseup',function (event) {thisinst.buttonSwitch(event,true,true)});
	this._addEventListener(newel,'mouseout',function (event) {thisinst.buttonSwitch(event,true,true)});
	this._addEventListener(newel,'click',function (event) {thisinst[actionfunc]();thisinst.cancelEvent(event)});
}

JsPanel.prototype.wipe = function()
{
	var thisinst = this;
	this.maindiv.innerHTML = "";           
	this.panelhead = this._addElement(this.maindiv,'div','JsPanel_panelhead','JsPanel_panelhead');
	this.panelHeadButton(this.panelhead,'close','hide');
	this.panelHeadButton(this.panelhead,'min','minimize');
	this.panelHeadButton(this.panelhead,'max','maximize');
	this.title.element = this._addElement(this.panelhead,'span','JsPanel_title_span','JsPanel_title_span');
	this.setTitle(this.title.text);

 	this.userdiv = this._addElement(this.maindiv,'div','JsPanel_usercontent','JsPanel_usercontent');
	this._addEventListener(this.userdiv,'mousedown',thisinst.cancelEvent,false); 
	this._addEventListener(this.userdiv,'mouseup',thisinst.cancelEvent,false); 
}

JsPanel.prototype.setTheme = function(themedir)
{
	var link = document.getElementById('JsPanel_Theme_Link');
	var hidden = this.element.className.match(/hidden/);
	var minimized = this.state.minimized;
	this.hide();
 	if (link) {
		document.getElementsByTagName('head')[0].removeChild(link);
	}
	this.themedir = themedir;
	this._addElement(document.getElementsByTagName('head')[0], 'link', 'JsPanel_Theme_Link',null,{type:'text/css',href:this.themedir + '/JsPanel_theme.css',rel:'stylesheet'}); 
	var bkgd = document.getElementById("JsPanel_midback");
	if (bkgd) bkgd.src = this.themedir + '/mid.png';
	if (!hidden) {
		this.show();
		if (minimized) this.minimize();
	}

}

JsPanel.prototype.parseCoord = function(x)
{
	var ret;
	var mat = x.match(/([0-9]+)[ ]?(px|%)?$/);
	if (mat) {
		switch (mat[2]) {
			case 'px':
			case '':
			case null:
				ret = mat[1] + 'px';
				break;
			case '%':
				ret = mat[1] + '%';
				break;
		}
	} else {
		ret = x;
	}
	return ret;
}

JsPanel.prototype.buildPanel = function(x,y,ht,wd)
{
	if (this.element && this.element.constructor.toString().match(/HTML([a-zA-Z0-9]*)Element/)) {
		this.element.className = 'JsPanel_hidden';
		this.element.innerHTML = '';
		this.element.parentNode.removeChild(this.element);
		this.element = null;
	}
	var thisinst = this;
	var el = this._addElement(null, 'div', 'JsPanel', 'JsPanel_hidden');
	this._addEventListener(el,'mousemove',function (event) {thisinst.mouseMoved(event,"panel")});
	this._addEventListener(el,'mouseup',function (event) {thisinst.mouseReleased(event)});
	this._addEventListener(el,'mousedown',function (event) {thisinst.mousePressed(event,"panel")});
	this._addEventListener(el,'mouseout',function (event) {thisinst.mouseMoved(event,"panel")});
	this._addEventListener(el,'mouseover',function (event) {thisinst.mouseMoved(event,"panel")});
	this._addEventListener(el,'click',function (event) {return});
	var left = this._addElement(el,'div','JsPanel_left', 'JsPanel_left');
	this._addElement(left,'div','JsPanel_ul', 'JsPanel_ul');
	this._addElement(left,'div','JsPanel_leftmid', 'JsPanel_leftmid');
	this._addElement(left,'div','JsPanel_ll', 'JsPanel_ll');
	var mid = this._addElement(el,'div','JsPanel_mid', 'JsPanel_mid');
	this._addElement(mid,'div','JsPanel_midupper', 'JsPanel_midupper');
	var midmain = this._addElement(mid,'div','JsPanel_midmain', 'JsPanel_midmain');
	this._addElement(midmain,'img','JsPanel_midback','JsPanel_midback',{src:this.themedir + '/mid.png'});
	this._addElement(mid,'div','JsPanel_midlower', 'JsPanel_midlower');
	var right = this._addElement(el,'div','JsPanel_right', 'JsPanel_right');
	this._addElement(right,'div','JsPanel_ur', 'JsPanel_ur');
	this._addElement(right,'div','JsPanel_rightmid', 'JsPanel_rightmid');
	this._addElement(right,'div','JsPanel_lr', 'JsPanel_lr');
	this.maindiv = this._addElement(el,'div','JsPanel_content','JsPanel_content');
	this.element = el;
	this._addElement(document.getElementsByTagName('head')[0], 'link', 'JsPanel_Link',null,{type:'text/css',href:'JsPanel.css',rel:'stylesheet'});
	this.setTheme(this.themedir);
	this.wipe();
	if (x) this.state.x = this.parseCoord(x);
	if (y) this.state.y = this.parseCoord(y);
	if (ht) this.state.ht = this.parseCoord(ht);
	if (wd) this.state.wd = this.parseCoord(wd);
	this.element.style.left = this.state.x;
	this.element.style.top = this.state.y;
	this.element.style.height = this.state.ht;
	this.element.style.width = this.state.wd;
	this._addEventListener(window,'mousemove',function(event) {thisinst.mouseMoved(event)},false);
	this._addEventListener(window,'mouseover',function(event) {thisinst.mouseMoved(event)},false);
	this._addEventListener(window,'mouseout',function(event) {thisinst.mouseMoved(event)},false);
	this._addEventListener(window,'mousedown',function(event) {thisinst.mousePressed(event,"body")},false);
// 	this._addEventListener(document.getElementsByTagName('body')[0],'mousemove',function(event) {thisinst.mouseMoved(event)},false);
//	this._addEventListener(document.getElementsByTagName('body')[0],'mouseover',function(event) {thisinst.mouseMoved(event)},false);
//	this._addEventListener(document.getElementsByTagName('body')[0],'mouseout',function(event) {thisinst.mouseMoved(event)},false);
//	this._addEventListener(document.getElementsByTagName('body')[0],'mousedown',function(event) {thisinst.mousePressed(event,"body")},false); 
	document.getElementsByTagName('body')[0].appendChild(el);
}

JsPanel.prototype.setTitle = function (str)
{
	this.title.text = str;
	if (this.title.element) this.title.element.innerHTML = this.title.text + '&nbsp;';
}

JsPanel.prototype.show = function ()
{
	if (!this.element || !this.element.constructor.toString().match(/HTML([a-zA-Z0-9]*)Element/)) throw "show(): Build Panel first";
	this.element.className = 'JsPanel_container';
 	this.element.style.left = this.state.x;
	this.element.style.top = this.state.y;
	this.element.style.height = this.state.ht;
	this.element.style.width = this.state.wd; 
	if (this.state.minimized) this.maximize();
}

JsPanel.prototype.hide = function ()
{
 	if (!this.element || !this.element.constructor.toString().match(/HTML([a-zA-Z0-9]*)Element/)) throw "showPanel(): Build Panel first";
	this.element.className = 'JsPanel_hidden'; 
}
