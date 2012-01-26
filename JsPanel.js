function JsPanel() 
{
	this.pressX = 0;
	this.pressY = 0;
	this.pressed = false;
	this.element = null;
	this.maindiv = null;
	this.imgdir = 'greenback';
}

JsPanel.prototype.resizePanel = function(w,h) {
  var ht = h || this.element.clientHeight;
  var wd = w || this.element.clientWidth;
  var height = parseInt(ht);
  var width = parseInt(wd);
  if ( height > 63 && width > 71 ) {
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
}

JsPanel.prototype.mouseMoved = function(evnt)
{
	if (!evnt) { evnt = window.event; }
	var el = evnt.currentTarget || evnt.srcElement;
	var x = evnt.layerX || evnt.offsetX;
	var y = evnt.layerY || evnt.offsetY;
	if (x < 10 && y < 10) {
		el.style.cursor = 'nw-resize';
	} else if ( x < 10 && y > (el.clientHeight - 12)) {
		el.style.cursor = 'sw-resize';
    	} else if (x > (el.clientWidth - 10) && y < 10) {
		el.style.cursor = 'ne-resize';
    	} else if (x > (el.clientWidth - 10) && y > (el.clientHeight - 12)) {
		el.style.cursor = 'se-resize';
	} else if (x < 6) {
		el.style.cursor = 'w-resize';
	} else if (y < 6) {
		el.style.cursor = 'n-resize';
	} else if (x > (el.clientWidth - 6)) {
		el.style.cursor = 'e-resize';
	} else if (y > (el.clientHeight - 8)) {
		el.style.cursor = 's-resize';
	} else {
		el.style.cursor = 'auto';
	}
}

JsPanel.prototype._addElement = function (parentel, tag, id, cssclass, attrs)
{
	var newel = document.createElement(tag);
	newel.id = id;
	if (cssclass != null) newel.className = cssclass;
	if (typeof attrs == "object") {
		for (var key in attrs) {
			newel[key] = attrs[key];
		}
	}
	if (parentel && parentel.constructor.toString().match(/HTML([a-zA-Z0-9]*)Element/)) parentel.appendChild(newel);
	return newel;
}

JsPanel.prototype.addElement = function (tag, id, cssclass, attrs)
{
	if (!this.maindiv || !this.maindiv.constructor.toString().match(/HTML([a-zA-Z0-9]*)Element/)) throw "addElement(): Build Panel first";
	return this._addElement(this.maindiv, tag, id, cssclass, attrs);
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
	var el = this._addElement(null, 'div', 'JsPanel', 'JsPanel_hidden',{onmousemove:thisinst.mouseMoved});
	var left = this._addElement(el,'div','JsPanel_left', 'JsPanel_left');
	this._addElement(left,'div','JsPanel_ul', 'JsPanel_ul');
	this._addElement(left,'div','JsPanel_leftmid', 'JsPanel_leftmid');
	this._addElement(left,'div','JsPanel_ll', 'JsPanel_ll');
	var mid = this._addElement(el,'div','JsPanel_mid', 'JsPanel_mid');
	this._addElement(mid,'div','JsPanel_midupper', 'JsPanel_midupper');
	this.maindiv = this._addElement(mid,'div','JsPanel_midmain', 'JsPanel_midmain');
	this._addElement(this.maindiv,'img','JsPanel_midback','JsPanel_midback',{src:this.imgdir + '/mid.png'});
	this._addElement(mid,'div','JsPanel_midlower', 'JsPanel_midlower');
	var right = this._addElement(el,'div','JsPanel_right', 'JsPanel_right');
	this._addElement(right,'div','JsPanel_ur', 'JsPanel_ur');
	this._addElement(right,'div','JsPanel_rightmid', 'JsPanel_rightmid');
	this._addElement(right,'div','JsPanel_lr', 'JsPanel_lr');
	this.element = el;
	this._addElement(document.head, 'link', 'JsPanel_Link',null,{type:'text/css',href:'JsPanel.css',rel:'stylesheet'});
	document.body.appendChild(el);
}

JsPanel.prototype.showPanel = function ()
{
	if (!this.element || !this.element.constructor.toString().match(/HTML([a-zA-Z0-9]*)Element/)) throw "showPanel(): Build Panel first";
	this.element.className = 'JsPanel_container';
}

