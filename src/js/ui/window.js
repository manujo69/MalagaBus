var util2 = require('util2');
var myutil = require('myutil');
var simply = require('simply');

var Emitter = require('emitter');

var buttons = [
  'back',
  'up',
  'select',
  'down',
];

var configProps = [
  'fullscreen',
  'style',
  'scrollable',
];

var actionProps = [
  'up',
  'select',
  'back',
];

var accessorProps = configProps;

var nextId = 1;

var Window = function(windowDef) {
  this.state = windowDef || {};
  this._id = nextId++;
  this._buttonInit();
};

util2.copy(Emitter.prototype, Window.prototype);

accessorProps.forEach(function(k) {
  Window.prototype[k] = myutil.makeAccessor(k);
});

Window.prototype._prop = function() {
  return simply.window.apply(this, arguments);
};

Window.prototype.show = function() {
  this._prop({});
  return this;
};

Window.prototype._clearAction = function() {
  actionProps.forEach(myutil.unset.bind(this, this.state.action));
};

Window.prototype._clear = function(flags) {
  flags = myutil.toFlags(flags);
  if (myutil.flag(flags, 'action')) {
    this._clearAction();
  }
};

Window.prototype.prop = function(field, value, clear) {
  if (arguments.length === 0) {
    return util2.copy(this.state);
  }
  if (arguments.length === 1 && typeof field !== 'object') {
    return this.state[field];
  }
  if (typeof clear === 'undefined') {
    clear = value;
  }
  if (clear) {
    this._clear('all');
  }
  var windowDef = myutil.toObject(field, value);
  util2.copy(windowDef, this.state);
  if (this._prop() === this) {
    this._prop(windowDef);
  }
  return this;
};

Window.prototype.action = function(field, value, clear) {
  var action = this.state.action;
  if (!action) {
    action = this.state.action = {};
  }
  if (arguments.length === 0) {
    return action;
  }
  if (arguments.length === 1 && typeof field !== 'object') {
    return action[field];
  }
  if (typeof clear === 'undefined') {
    clear = value;
  }
  if (clear) {
    this._clear('action');
  }
  if (typeof field !== 'boolean') {
    util2.copy(myutil.toObject(field, value), this.state.action);
  }
  simply.action.call(this);
  return this;
};

var isBackEvent = function(type, subtype) {
  return ((type === 'singleClick' || type === 'longClick') && subtype === 'back');
};

Window.prototype.onAddHandler = function(type, subtype) {
  if (isBackEvent(type, subtype)) {
    this._buttonAutoConfig();
  }
};

Window.prototype.onRemoveHandler = function(type, subtype) {
  if (!type || isBackEvent(type, subtype)) {
    this._buttonAutoConfig();
  }
};

Window.prototype._buttonInit = function() {
  this.state.button = {
    config: {},
    configMode: 'auto',
  };
  for (var i = 0, ii = buttons.length; i < ii; i++) {
    var button = buttons[i];
    if (button !== 'back') {
      this.state.button.config[buttons[i]] = true;
    }
  }
};

/**
 * The button configuration parameter for {@link simply.buttonConfig}.
 * The button configuration allows you to enable to disable buttons without having to register or unregister handlers if that is your preferred style.
 * You may also enable the back button manually as an alternative to registering a click handler with 'back' as its subtype using {@link simply.on}.
 * @typedef {object} simply.buttonConf
 * @property {boolean} [back] - Whether to enable the back button. Initializes as false. Simply.js can also automatically register this for you based on the amount of click handlers with subtype 'back'.
 * @property {boolean} [up] - Whether to enable the up button. Initializes as true. Note that this is disabled when using {@link simply.scrollable}.
 * @property {boolean} [select] - Whether to enable the select button. Initializes as true.
 * @property {boolean} [down] - Whether to enable the down button. Initializes as true. Note that this is disabled when using {@link simply.scrollable}.
 */

/**
 * Changes the button configuration.
 * See {@link simply.buttonConfig}
 * @memberOf simply
 * @param {simply.buttonConfig} buttonConf - An object defining the button configuration.
 */
Window.prototype.buttonConfig = function(buttonConf, auto) {
  var buttonState = this.state.button;
  if (typeof buttonConf === 'undefined') {
    var config = {};
    for (var i = 0, ii = buttons.length; i < ii; ++i) {
      var name = buttons[i];
      config[name] = buttonConf.config[name];
    }
    return config;
  }
  for (var k in buttonConf) {
    if (buttons.indexOf(k) !== -1) {
      if (k === 'back') {
        buttonState.configMode = buttonConf.back && !auto ? 'manual' : 'auto';
      }
      buttonState.config[k] = buttonConf[k];
    }
  }
  if (simply.impl.buttonConfig) {
    return simply.impl.buttonConfig(buttonState.config);
  }
};

Window.prototype._buttonAutoConfig = function() {
  var buttonState = this.state.button;
  if (!buttonState || buttonState.configMode !== 'auto') {
    return;
  }
  var singleBackCount = this.listenerCount('singleClick', 'back');
  var longBackCount = this.listenerCount('longClick', 'back');
  var useBack = singleBackCount + longBackCount > 0;
  if (useBack !== buttonState.config.back) {
    buttonState.config.back = useBack;
    return this.buttonConfig(buttonState.config, true);
  }
};

module.exports = Window;
