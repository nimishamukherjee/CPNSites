$(document).ready(function() {
	//=======================L I S T  O F  D E V I C E S====================			
	//Get the list of devices
	var getListOfDevicesUrl = Backbone.Model.extend({
		urlRoot : "data/listofdevices.json"
		//url :function(){return "/Orchestration/account/"+accountID+"/devices"}
	});
	//Define Each Device for the List Model 
	var DeviceListModel = Backbone.Model.extend({
		url:"http://www.google.com"
		//url :function(){return "/Orchestration/account/"+accountID+"/devices" + (this.get("id") == null ? "" : "/" + this.get("id"))}
    });    
    //Collection of devices
    var DeviceList = Backbone.Collection.extend({
		model: DeviceListModel
	});
	
	//Define individual device list view - activated
	var EachDevInListActView = Backbone.View.extend({
		tagName: "tr",
        className: "eachdevlistact",
        template: $("#activatedDevicesTemplate").html(),
        eachDeviceListTempl: "eachdevlistTempl",
        
        events: {
          "click td": "startDevInfoDisplay",
        },        
       
        render: function (ref) {
            var _self = this;
           	var data = this.model.toJSON();
            this.compiled = dust.compile(this.template,this.eachDeviceListTempl);            
            dust.loadSource(this.compiled);            
            dust.render(this.eachDeviceListTempl,data,function(err,out){
            	_self.$el.html(out);
            });
            return this;
        },
        
        startDevInfoDisplay: function(e){
        	deviceID = this.model.get('id');
        }
	});
	
	//Define individual device list view - pending activation
	var EachDevInListPendActView = Backbone.View.extend({
		tagName: "tr",
        className: "eachdevlistpendact",
        template: $("#pendingActivationTemplate").html(),
        eachDeviceListTempl: "eachdevlistTempl",
        
         events: {
          "click td": "storeDeviceType",
         }, 
        
        render: function () {
            var _self = this;
           	var data = this.model.toJSON();
           	this.compiled = dust.compile(this.template,this.eachDeviceListTempl);            
            dust.loadSource(this.compiled);
            
           	dust.render(this.eachDeviceListTempl,data,function(err,out){
           		_self.$el.html(out);
           	});           
            return this;
        },
        
        storeDeviceType: function(ref){
        	activateDeviceType = this.model.get("type");
        }
                
	});
	//=======================A C T I V A T E  A  D E V I C E ====================
	//Define Activate a device view
	var ActivateADeviceView = Backbone.View.extend({
		tagName: "div",
        className: "actAdev",
        template: $("#activateAdeviceTemplate").html(),
        actTmpl: "activateadeviceTempl",     
        
         events:{
        	"click button.activateDevice": "activateDevice",
        	"click button.cancel": "fnCancel",
        },    
        
        render: function () {
            var _self = this;
           	var data = this.model.toJSON();
           	this.compiled = dust.compile(this.template,this.actTmpl);            
            dust.loadSource(this.compiled);
 			dust.render(this.actTmpl,data,function(err,out){
           		_self.$el.html(out);
       		});
       		 return this; 	
        },
        
        activateDevice:function(e){
        	e.preventDefault();
        	var that = this;
        	var data = Backbone.Syphon.serialize(this);
			this.model.set(data);
			this.model.save(null, {
				success:function(){
					alert("done");
					location.href = ""								            		
				},
				error:function(m,xhr,o){
					location.href = ""
					alert("error")
				}
			})
        },
        
        fnCancel: function(e){
        	e.preventDefault();
        }       
	});
	
	//define master view
    var ListOfDevicesView = Backbone.View.extend({
    	eachDevView: null,

       render: function () {
            var that = this;
            _.each(this.collection.models, function (item) {
                that.renderDeviceList(item);
            }, this);
        },

        renderDeviceList: function (item) {
        	if(item.toJSON().serial==null){
        		//check if activate a device
        		if(activateDeviceType==item.toJSON().type){
        			this.eachDevView = new ActivateADeviceView({
     	           		model: item
            		});
          			$("#activateadevice").append(this.eachDevView.render().el);
        		}else{
        			this.eachDevView = new EachDevInListPendActView({
     	           		model: item
            		});
          			$("#pendactivatedevlist").append(this.eachDevView.render().el);
          		}
        	}else{
        		this.eachDevView = new EachDevInListActView({
     	           model: item
            	});
          		$("#activateddevicelist").append(this.eachDevView.render().el);
          }
        }        
       
    });
    
     //=======================E A C H  D E V I C E  I N F O R M A T I O N====================    
   	//Get the each device information
   	//Model
	var getADeviceInfo = Backbone.Model.extend({
		urlRoot : "data/deviceInfo.json"
		//url :function(){return "/Orchestration/account/"+accountID+"/devices" + (this.get("id") == null ? "" : "/" + this.get("id"))}
	});
	//View
	var DeviceInfoView = Backbone.View.extend({
		tagName: "div",
        className: "deviceInfo",
        template: $("#deviceInfoViewTemplate").html(),
        currentTemplate: $("#deviceInfoViewTemplate").html(),
        editTemplate: $("#deviceInfoEditTemplate").html(),
        eachDeviceViewTempl: "devInfoTempl",
        
        events: {
        	"click button.editDevice": "fnEditDevDetails",
        	"click button.deleteDevice": "fnDeleteDevDetails",
        	"click button.saveDeviceEdits": "fnSaveDeviceEdit",
        	"click button.cancelDeviceEdits": "fnCancelDeviceEdits",
        },  
        
        initialize: function(){
			this.on('completeDeviceDelete', this.fnCompleteDeviceDelete, this);
		},  
       
        render: function (ref) {
            var _self = this;
           	var data = this.model.toJSON();       
           	viewDeviceName = this.model.get("name");    	
            this.compiled = dust.compile(this.currentTemplate,this.eachDeviceViewTempl);            
            dust.loadSource(this.compiled);            
            dust.render(this.eachDeviceViewTempl,data,function(err,out){
            	_self.$el.html(out);
            });
            return this;
        },
        
        fnEditDevDetails: function(e){
        	e.preventDefault();
        	this.currentTemplate = this.editTemplate;
        	this.render();
        },
        
        fnSaveDeviceEdit: function(e){
        	e.preventDefault();
        	var that = this;
        	var data = Backbone.Syphon.serialize(this);
			this.model.set(data);
			//save to server
			this.model.save(null, {
				success:function(){
					alert("done");							            		
				},
				error:function(m,xhr,o){
					alert("error")
				}
			})	
			this.currentTemplate = this.template;
			this.render();
        },
        
        fnDeleteDevDetails: function(e){
        	e.preventDefault();
        	//double popup for clarification
        	fnShowAlert("Are you sure you want to delete this device","delete","device");
        	
        },
        
        fnCompleteDeviceDelete: function(e){
        	this.remove();
        	this.model.destroy({
					success:function(){
					},
					error: function(){
					}
				});	
			viewDeviceName = "";
			location.href="";
        },
        
        fnCancelDeviceEdits: function(e){
        	e.preventDefault();
        	this.currentTemplate = this.template;
			this.render();
        }
       
	});
	
	//============================F I R E W A L L=====================
	var getFirewallUrl = Backbone.Model.extend({
		urlRoot : "data/firewall.json"
	});
	
	//Define Provider Network Model 
	var RuleModel = Backbone.Model.extend({
        defaults: {
        	'name':'',
        	'description':'',
        	'action':''        	
      	}
      		   
    });
    //Collection of rules
    var RuleList = Backbone.Collection.extend({
		model: RuleModel
	});
	
    //Define Policy Model 
	var PolicyModel = Backbone.Model.extend({
		defaults:{
			'default':"",
			'rules':""
		},
		url:"http://www.google.com"
		//urlRoot: "http://admin.qa.intercloud.net/Orchestration/account/devices/"+deviceID+"/firewall/"+policyid
    		  		   
    });
	
	//Define Firewall List (collection of models)
	var FirewallList = Backbone.Collection.extend({
		model: PolicyModel
	});
	
	//Define individual rule view
	var RuleView = Backbone.View.extend({
		tagName: "div",
        className: "eachrule",
        template: $("#ruleViewTemplate").html(),
        currentTemplate: $("#ruleViewTemplate").html(),
        editTemplate: $("#ruleEditTemplate").html(), 
        editNatTemplate: $("#ruleNatEditTemplate").html(),
        rlTempl: "ruleTempl",
        compiled: null,
        parentref: null,
        
       events:{
        	"click button.editRule": "editFirewallRule",
        	"click button.removeRule": "deleteFirewallRule",
        	"click button.saveRule": "saveFirewallRule",
        	"click button.cancel": "fnCancel",
        	"change select.dropdown": "fnDropDowns",
        	"keyup input": "fnCheckInput",
        },        
       
        render: function (ref) {
        	if(ref){
        		this.parentref = ref;
        	}
            var _self = this;
            if(this.model != null){
            	var data = this.model.toJSON();
            	//For new rule - show the edit template
            	if(this.model.get('id')==null){
            		if(this.parentref.fnReturnPolicy()=="nat"){
        				this.currentTemplate = this.editNatTemplate;
        			}else{
	            		this.currentTemplate = this.editTemplate;
	            	}
    	        }
            }            
            this.compiled = dust.compile(this.currentTemplate,this.rlTempl);            
            dust.loadSource(this.compiled);            
            dust.render(this.rlTempl,data,function(err,out){
            	_self.$el.html(out);
            });
            //if(this.model.get('id')){
            	//Edit - after rendering - check for dropdowns
            	this.fnSetDropdownsVals();
            //}
            return this;
        },
        
        editFirewallRule:function(e){
        	e.stopPropagation();
        	if(this.parentref.fnReturnPolicy()=="nat"){
        		this.currentTemplate = this.editNatTemplate;
        	}else{
        		this.currentTemplate = this.editTemplate;
        	}
        	this.render();
        },
        
        saveFirewallRule:function(e){
        	e.preventDefault();
        	var data = Backbone.Syphon.serialize(this);
        	this.currentTemplate = this.template;
        	this.model.set(data);  
        	if(data.id){      	
	        	//save to parent policy
   				this.parentref.savePolicy(data,this.parentref,"");
   			}else{
   				//add to parent policy
   				this.parentref.savePolicy(data,this.parentref,"add");
   			}       	
		},
		
		deleteFirewallRule:function(e){
			e.preventDefault();
			this.remove();
        	this.model.destroy();
		},
		
		fnCancel:function(e){
			e.preventDefault();
			if(this.model.get('id')){
				this.currentTemplate = this.template;
				this.render();
			}else{
				this.remove();
        		this.model.destroy();
			}
        	
		},
		
		fnSetDropdownsVals:function(){
			var that = this;
			var policyType = this.parentref.fnReturnPolicy();
			switch(policyType){
				case "lan":
					var optstr = "<option>Accept</option><option>Reject</option><option>Drop</option><option>Static NAT</option>";
					this.$("#action").html(optstr)
				break;
				case "wan":
					var optstr = "<option>Accept</option>,<option>Reject</option><option>Drop</option><option>Port Forward</option><option>Service bypass</option>";
					this.$("#action").html(optstr)
				break;
			}			
			if(this.model.get('id')){
				this.$('select > option').each(function() {
					var optVal = $(this).val().toLowerCase();
					//action
    				if(optVal==that.model.get('action').toLowerCase()){
    					$(this).attr('selected','selected');
    					that.fnSetDropDowns($(this).parent());
    				}
    				//protocol    			
    				if(optVal==that.model.get('protocol').toLowerCase()){
    					$(this).attr('selected','selected');
    					that.fnSetDropDowns(that.$("#protocol"));
    				}
    				//range
    				if(optVal==((that.model.get('source')).range).toLowerCase()){
    					$(this).attr('selected','selected');
    					that.fnSetDropDowns($(this).parent());
    				}
    				//operator
    				if(optVal==((that.model.get('source')).operator).toLowerCase()){
    					$(this).attr('selected','selected');
    				}
    				//range
    				if(optVal==((that.model.get('destination')).range).toLowerCase()){
	    				$(this).attr('selected','selected');
    					that.fnSetDropDowns($(this).parent());
    				}
    				//operator
    				if(optVal==((that.model.get('destination')).operator).toLowerCase()){
    					$(this).attr('selected','selected');
    					that.fnSetDropDowns($(this).parent());
    				}
    			});
			}else{
				//Blank template
				this.$('select > option').each(function() {
					var optVal = $(this).val().toLowerCase();				
    				that.fnSetDropDowns($(this).parent());    				
   					that.fnSetDropDowns(that.$("#protocol"));
				});
			}				
			
		},
		
		fnDropDowns:function(e){		
			e.preventDefault();
			this.fnSetDropDowns(e.currentTarget);
		},
		
		fnSetDropDowns:function(ref){			
			switch($(ref).attr('name')){
				case 'action':
					switch($(ref).val().toLowerCase()){
						case "port forward":
							//port forward
							this.$("#protocol").html("<option>ICMP</option><option>TCP</option><option>UDP</option>");
							this.$('.mainmod').removeClass('hidden');							
							this.$('.misc').removeClass('hidden');
							this.$('.publicvpn').addClass('hidden');
							this.$('.notes').addClass('hidden');				
						break;
						case "service bypass":
							this.$('.mainmod').addClass('hidden');							
							this.$('.misc').addClass('hidden');
							this.$('.notes').removeClass('hidden');
						break;
						case "static nat":
							this.$(".proto").css("display","none")
							this.$('.misc').removeClass('hidden');
							this.$('.forwardto').addClass('hidden');							
							this.$('.publicvpn').removeClass('hidden');
							this.$('.operatorset').addClass('hidden');
							this.$('.range').addClass('hidden')
							this.$(".sourceip").removeClass("hidden");
							this.$(".destinationip").removeClass("hidden");							
						break;
						default:
							//hide forward to/bypass							
							this.$(".misc").addClass("hidden");
							this.$("#protocol").html("<option>ICMP</option><option>IP</option><option>TCP</option><option>UDP</option><option>RDP</option><option>RSVP</option><option>GRE</option><option>ESP</option><option>AH</option><option>L2TP</option>");
						break;
					}
				break;
				case 'protocol':
					//Operator n Port
					if(($(ref).val().toLowerCase()=="icmp") || ($(ref).val().toLowerCase()=="tcp") || ($(ref).val().toLowerCase()=="udp")){
						this.$(".operatorset").removeClass("hidden");
					}else{
						this.$(".operatorset").addClass("hidden");
					}
				break;
				case 'source[operator]':	
					if($(ref).val().toLowerCase()=="equal"){
						this.$(".sourceportto").addClass("hidden");
					}else{
						this.$(".sourceportto").removeClass("hidden");
					}
				break;
				case 'destination[operator]':
					if($(ref).val().toLowerCase()=="equal"){
						this.$(".destinationportto").addClass("hidden");
					}else{
						this.$(".destinationportto").removeClass("hidden");
					}
				break;
				case 'source[range]':	
					switch($(ref).val().toLowerCase()){
						case 'any':
							//hide ip and subnet
							this.$(".sourceip").addClass("hidden");
							this.$(".sourcesubnet").addClass("hidden");							
						break;
						case 'network':
							this.$(".sourceip").removeClass("hidden");
							this.$(".sourcesubnet").removeClass("hidden");							
						break;
						case 'host':
							this.$(".sourceip").removeClass("hidden");
							this.$(".sourcesubnet").addClass("hidden");
						break;
					}
				break;
				case 'destination[range]':
					switch($(ref).val().toLowerCase()){
						case 'any':
						//hide ip and subnet
							this.$(".destinationip").addClass("hidden");
							this.$(".destinationsubnet").addClass("hidden");
							this.$(".operator").addClass("hidden");
						break;
						case 'network':
							this.$(".destinationip").removeClass("hidden");
							this.$(".destinationsubnet").removeClass("hidden");
							this.$(".operator").removeClass("hidden");
						break;
						case 'host':
							this.$(".destinationip").removeClass("hidden");
							this.$(".destinationsubnet").addClass("hidden");
							this.$(".operator").addClass("hidden");
						break;
					}
				break;
			}
		
		},
		
		fnCheckValidityAll:function()
        {
			 
		},
		
		fnCheckInput: function(e)
        {
        	e.preventDefault();
   			var ip = new RegExp("^([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])$");
    		//var ref = "#"+$(e.target).attr('name').replace('[','').replace(']','');
    		var ref = "#"+$(e.target).attr('name');
    		if(ref.indexOf('[ip]')>=0 || ref.indexOf('subnet')>=0){
	    		if(($(e.target).val()).match(ip)){
		    		$(e.target).removeClass("error");
	    		}else{
	    			$(e.target).addClass("error");
	    		}
    		}
    		this.fnCheckValidityAll();
		}
		
	});
	
	var RuleListView = Backbone.View.extend({
		parentRefHtml: null,
		parentRef:null,
			
		render: function (ref) {
			this.parentRefHtml = $(ref.el);
			this.parentRef = ref;
            var that = this;
            _.each(this.collection.models, function (item) {
                that.renderRule(item,this.parentRef);
            }, this);
        },

        renderRule: function (item,ref) {
            var rlView = new RuleView({
                model: item
            });
            this.parentRefHtml.append(rlView.render(ref).el);
        },
        
        addNewRule: function(ref){
        	var ruleObj = new RuleView();
    		this.collection.add(ruleObj);
    		this.parentRefHtml.find(".eachrule").remove();
    		this.render(ref);
        }
	})
	
	//Define individual policy view
	var FirewallView = Backbone.View.extend({
		tagName: "div",
        className: "box",
        template: $("#firewallViewTemplate").html(),
        fwTmpl: "firewallTempl",
        compiled: null,   
        ruleListRender: null,
        htmlref: null,
        viewRef:null,
        
        events:{
        	"click button.addRule": "addFirewallRule",
        },
        
        initialize:function(){
            this.compiled = dust.compile(this.template,this.fwTmpl);
            var ref = dust.loadSource(this.compiled);
            //this.model.bind("change:rules", this.subRender, this);
            this.model.bind("change", this.render, this);
            
        },
        
        render: function () {        		
            var _self = this;
            var data = this.model.toJSON();
            dust.render(this.fwTmpl,data,function(err,out){
            	_self.$el.html(out);
            });
            this.subRender();            
            return this;
        },
        
        subRender: function(){
        	this.htmlref = $(this.el);
        	this.viewRef = this;
            this.ruleListRender = new RuleListView();
            this.ruleListRender.on('change',this.fnHello);
           	this.ruleListRender.collection = new RuleList(this.model.get('rules'));
			this.ruleListRender.render(this.viewRef);
        },
        
        fnReturnPolicy:function(){
        	switch(this.model.get('policy'))
        	{
        		case "wan2lan":
        		case "vpn2lan":
        			return "wan";
        			break;
        		case "lan2wan":
        		case "lan2vpn":
        		case "lan2lan":
        			return "lan";
        			break;        			
        		case "lannatwan":
        			return "nat";
        			break;
        		
        	}
        },
        
        savePolicy: function(data,ref,str){
        	var that = ref;
        	var oldData = ref.model.toJSON();
        	var rules = ref.model.get("rules");
        	var rules_arr=new Array()
        	if(str=="add"){
        		//This is for offline
        		data.id="123"
  		       	_.each(rules, function (item) {
	        			rules_arr.push(item)		
	            }, this);
	            rules_arr.push(data)	    
        	}else{ 
        		var rules_arr=new Array()  	
	        	_.each(rules, function (item) {
	        		if(item.id==data.id){
	        			rules_arr.push(data)		
	        		}else{
	        			rules_arr.push(item)
	        		}
	            }, this);
	     	}
	     	ref.model.set("rules",rules_arr);        	
			ref.model.save(null, {
				success:function(){
					alert("save");
					
				},
				error:function(){											
					//that.model.set('rules',oldData.get('rules'));
            		alert("err");
				}
			});
			
        },
        
        addFirewallRule:function(e){
        	e.preventDefault();
        	//add a new rule - show the rule edit template
    		this.ruleListRender.addNewRule(this.viewRef); 
        }        
        
	});
	//define master view
    var MasterFirewallView = Backbone.View.extend({
    	el: $("#viewFirewall"),
    	fwView: null,

       render: function () {
            var that = this;
            _.each(this.collection.models, function (item) {
                that.renderFirewall(item);
            }, this);
        },

        renderFirewall: function (item) {
            this.fwView = new FirewallView({
                model: item
            });
            this.$el.append(this.fwView.render().el);
        }
    });
	
	//=======================R O U T E R====================
    var ListOfDevRouter = Backbone.Router.extend({
    	eachDevInfoView: null,
    	
        routes: {
            "": "fnGetListOfDev",
            "activate": "fnActivate",
            "deviceInfo": "fnDeviceInfo",
            "firewall":"fnGetFirewall",
            "network":"fnGetNetwork"
        },

        fnGetListOfDev: function (type) {
			this.router_devlist=new getListOfDevicesUrl();
			this.router_devlist.fetch({
				success:function(model, response){
					listOfDevicesRender.collection = new DeviceList(response);
					listOfDevicesRender.render();	
				},
				error:function(data){
					alert("Error loading json")
				}
			});
			   
        },
        //Activate a device
        fnActivate: function(){
        	fnUpdateSectionDisplay("#activateadevice");
        	this.fnGetListOfDev();
        },
        //Display a devices's information
        fnDeviceInfo: function(){
        	var that = this;
			fnUpdateSectionDisplay("#eachDeviceInformation");
        	this.router_devinfo=new getADeviceInfo();
			this.router_devinfo.fetch({
				success:function(model, response){										
					that.eachDevInfoView = new DeviceInfoView({
     		           model: model
            		});
          			$("#eachDeviceInformation").append(that.eachDevInfoView.render().el);
				},
				error:function(data){
					alert("Error loading json")
				}
			});
			   
        	
        },        
        fnStartDelete: function(){
        	this.eachDevInfoView.trigger("completeDeviceDelete")
        },
        //Firewall
        fnGetFirewall: function () {
        	fnUpdateSectionDisplay("#viewFirewall");
        	//viewDeviceName = this.model.get('name')
        	$("#viewFirewall .deviceNm").html(viewDeviceName)
			this.fw_router=new getFirewallUrl();
			this.fw_router.fetch({
				success:function(model, response){
					firewallRender.collection = new FirewallList(response);
					firewallRender.render();	
				},
				error:function(data){
					alert("Error loading json")
				}
			});
			   
        },
        //Network
        fnGetNetwork: function(){
        	fnUpdateSectionDisplay("#viewNetwork");	
        	$("#viewNetwork .deviceNm").html(viewDeviceName)
        }
        
           
    });	 
    sitesRouter = new ListOfDevRouter();   
	Backbone.history.start();
	listOfDevicesRender = new ListOfDevicesView();
	firewallRender = new MasterFirewallView();
});