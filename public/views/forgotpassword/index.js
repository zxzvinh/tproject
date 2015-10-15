(function(){
	'use strict';

	app = app || {};

	app.Forgot = Backbone.Model.extend({
		url: '/forgot-password',
		defaults:{
			success:false,
			errors:[],
			errfor:{},
			email:''
		}
	});

	app.ForgotView = Backbone.View.extend({
		el: '#forgotpassword',
		template: _.template($('#tmpl-forgotpassword').html()),
		events:{
			'submit form': 'submit',
			'keypress [name="email"]': 'onEnter',
			'click .btn-forgot': 'forgot'
		},
		initialize: function(){
			this.model = new app.Forgot();
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		render: function(){
			this.$el.html(this.template(this.model.attributes));
			this.$el.find('[name="email"]').focus();
			return this;
		},
		submit: function(e){
			e.preventDefault();
		},
		onEnter: function(e){
			if(e.keycode !== 13){return;}
			e.preventDefault();
			this.forgot();
		},
		forgot: function(e){
			this.$el.find('.btn-forgot').attr('disabled',true);
			this.model.save({
				email:this.$el.find('[name="email"]').val()
			});
		}
	});

	$(document).ready(function(){
		app.forgotView = new app.ForgotView();
	});

}());