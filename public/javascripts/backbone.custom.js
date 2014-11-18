Backbone.View.prototype.kill = function () {
	if (this.beforeKill) {
		this.beforeKill();
	}

	this.remove();
	this.off(); // unbind events that are set on this view
	// remove all models bindings made by this view (do not affect any other observer to this model)
	if (this.model) {this.model.off( null, null, this );}
};