
(function(){

 	// app = app || {};

 	// app.menu = Backbone.Model.extend({
 	// 	url: '/admin/menu',
 	//     defaults: {
 	//       errors: [],
 	//       errfor: {},
 	//       data:{
 	//       	mon:'',
 	//       	phan_loai:'',
 	//       	gia:'',
 	//       	gia_nap:''
 	//       }
 	//     }
 	// });

 	// app.MenuView = Backbone.View.extend({
 	// 	el:'#menu',
 	// 	template: _.template( $('#tmpl-menu').html() ),
 	// 	events:{
 	// 		'submit form': 'submit'
 	// 	},
 	// 	initialize: function(){
		// 	this.model = new app.menu();
		// 	this.listenTo(this.model, 'sync', this.render);
		// 	this.render();
		// },
		// render: function(){
		// 	this.$el.html(this.template(this.model.attributes));

		// },
 	// 	submit:function(e){
 	// 		e.preventDefault();
 	// 	}
 	// });

 	$(document).ready(function() {
    	//app.menuView = new app.MenuView();

	 	var editor = new $.fn.dataTable.Editor( {
            ajax: "/admin/menu",
            table: "#menu-table",
            fields: [ {
                  label: "Món:",
                    name: "mon"
                }, {
                    label: "Phân loại:",
                    name: "phan_loai"
                }, {
                    label: "Giá:",
                    name: "gia"
                }, {
                    label: "Giá nhập:",
                    name: "nhap"
                }
            ]
    	} );

        // Activate an inline edit on click of a table cell
        $('#menu-table').on( 'click', 'tbody td:not(:first-child)', function (e) {
            editor.inline( this );
        } );

        $('#menu-table').DataTable( {
            dom: "Bfrtip",
            ajax: "/admin/menu/list",
            columns: [
                {
                    data: null,
                    defaultContent: '',
                    className: 'select-checkbox',
                    orderable: false
                },
                { data: "mon" },
                { data: "phan_loai" },
                { data: "gia" },
                { data: "nhap" }
            ],
            select: {
                style:    'os',
                selector: 'td:first-child'
            },
            buttons: [
                { extend: "create", editor: editor },
                { extend: "edit",   editor: editor },
                { extend: "remove", editor: editor }
            ]
        } );

  	}); // end document query

 }());