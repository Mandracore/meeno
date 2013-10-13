var meenoAppCli = meenoAppCli || {};
meenoAppCli.Classes = meenoAppCli.Classes || {};

meenoAppCli.Classes.BrowserBodyTagView = meenoAppCli.Classes.BrowserBodyObjectView.extend({

	template : '#overview-tag-template',

	events: function(){
		return _.extend({},meenoAppCli.Classes.BrowserBodyObjectView.prototype.events,{
			'click .edit'    : 'edit',
			'click .delete'  : 'delete',
			'blur .label'    : 'save'
		});
	}

	// Renders the tag item to the current state of the model
	render: function() {
		console.log ("R[list-tag]");
		var templateFn = _.template( $(this.template).html() );
		this.$el.html (templateFn (this.model.toJSON()));
		return this;
	},

	edit: function() {
		console.log('edit');
		this.$("span.label").attr('contenteditable','true').focus().select();
		document.execCommand('selectAll',false,null);
	},

	save: function() {
		this.$("span.label").attr('contenteditable','false');
		console.log('save');
		this.model.set({
			label  :this.$("span.label").html()
		}).save({},{
			success: function() {
				console.log('save success');
			},
			error  : function() {
				console.log('save error');
			}
		});
	},

	delete: function() {
		this.model.destroy();
		meenoAppCli.Tags.remove(this.model);
		this.remove();
		console.log('tag deleted')
	},
});