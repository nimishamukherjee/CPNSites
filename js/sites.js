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
    	el: $("#firewallrules"),
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
	//=======================N E T W O R K  I N T E R F A C E====================
	//Get the network url
	var getNetworkUrl = Backbone.Model.extend({
		urlRoot : "data/network.json"
	});
	
	//Network Interface Model 
	var interfaceModel = Backbone.Model.extend({
        defaults: {
        	'name':'',
        	'config':[],
        	'dhcp':{},
        	'staticIP':[],
        	'vlan':[]
      	},
      	url:"http://www.google.com",
      	//url :function(){return "Orchestration/account/"+accountID+"/devices/"+deviceid+"/networkinterface/" + (this.get("id") == null ? "/" : "/" + this.get("id"))}
      	parse: function(response){
	        for(var key in this.model)
	        {
	            var embeddedClass = this.model[key];
	            var embeddedData = response[key];
	            response[key] = new embeddedClass(embeddedData, {parse:true});
	        }
	        return response;
    	},
    	initialize: function(){
    		//use memento for cancel 
		    var memento = new Backbone.Memento(this);
    			_.extend(this, memento);
  		}	
    });
    //Collection of interfaces
    var InterfaceList = Backbone.Collection.extend({
		model: interfaceModel
	});	
	//Define individual interface view
	var InterfaceView = Backbone.View.extend({
		tagName: "div",
        className: "eachInterface",
        template: $("#networkViewTemplate").html(),
        currentTemplate: $("#networkViewTemplate").html(),
        editTemplate: $("#networkEditTemplate").html(), 
        nwTempl: "nwInterfaceTempl",     
        complied: null,   
        
        events:{
        	"click button.editInterface": "fnEditInterface",
        	"click button.cancelEditInterface": "fnCancelEditInterface",
        	"click button.saveEditInterface": "fnSaveEditInterface",
        	"click button.addServerRange": "fnAddServerRange",
        	"click button.deleteserverrange": "fnDeleteServerRange",        	
        	"click button.addStaticIP": "fnAddStaticIp",
        	"click button.deleteStaticIp": "fnDeleteStaticIp",
        	"click button.addVlanServeRange": "fnAddVlanServerRange",    
        	"click button.deleteVlanServerRange": "fnDelVlanServerRange",
        	"click button.addVlanStaticIp": "fnAddVlanStaticIp",    
        	"click button.deleteVlanStaticIp": "fnDelVlanStaticIp",
        	"click button.addvlaninterface": "fnAddVlanInterface",   
        	"click button.delvlaninterface": "fnDelVlanInterface",        	     	
        	"click input[type=radio]": "fnSetInterfaceType",
        	"click input[type=checkbox]": "fnSetDhcpServer"
        },
       
        render: function () {
        	vlanCtr=-1;
            var _self = this;            
           	var data = this.model.toJSON(); 
            this.compiled = dust.compile(this.currentTemplate,this.nwTempl);            
            dust.loadSource(this.compiled);
            dust.render(this.nwTempl,data,function(err,out){
            	_self.$el.html(out);
            });
            return this;
        },
        //Edit Main Interface
        fnEditInterface: function(e){
        	e.preventDefault();
        	this.model.store();
        	this.currentTemplate = this.editTemplate;
        	this.render();
        },
        //Cancel on Main Interface
        fnCancelEditInterface: function(e){
        	e.preventDefault();
        	this.model.restore();
        	this.currentTemplate = this.template;
        	this.render();
        	
        },
        //Save on Main interface
        fnSaveEditInterface: function(e){
        	e.preventDefault();
        	var data = this.cleanUpArrays(Backbone.Syphon.serialize(this));
        	var that = this;
			this.model.set(data);
			this.model.save(null, {
					success:function(){
						alert("success")					
					},
					error:function(m,xhr,o){
						alert("error")
					}
			});
			this.currentTemplate = this.template;
        	this.render();
        },
        //Add DHCP on Base Interface
        fnAddServerRange: function(e){
			e.preventDefault();
			this.saveState();    		
			this.model.get("dhcp").ranges.push({'from':'','to':''});			
        	this.render();
    	}, 
    	//Delete DHCP on Base Interface
    	fnDeleteServerRange: function(e){
			e.preventDefault();
			this.saveState();
			var ranges = this.model.get("dhcp").ranges;
        	var id = $(e.target).attr("id");
        	ranges.splice(id,1);
        	this.model.get("dhcp").ranges = ranges;     	
        	this.render();
    	},
    	//Add Static IP Route on Base Interface
    	fnAddStaticIp: function(e){
			e.preventDefault(); 		
			this.saveState();
			this.model.get("staticiproute").push({'networkhost':'','subnetmask':'','gateway':'','sharevpn':false});
			this.render()
    	}, 
    	//Delete Static IP on Base Interface
    	fnDeleteStaticIp:function(e){
			e.preventDefault();
			this.saveState();
			var staticips = this.model.get("staticiproute");
        	var id = $(e.target).attr("id");
        	//delete staticips[id];
        	staticips.splice(id,1)     	
        	this.model.set("staticiproute",staticips);        	
        	this.render();        	
    	},
    	//Add DHCP on VLAN Interface
    	fnAddVlanServerRange: function(e){
			e.preventDefault();
			this.saveState();
			var id = parseInt($(e.target).attr("id"));
			var vlans = this.model.get("vlaninterfaces");			
			vlans[id].dhcp.ranges.push({'from':'','to':''});			
        	this.render();
    	}, 
    	//Delete DHCP Server Range on VLAN Interface
    	fnDelVlanServerRange: function(e){
			e.preventDefault();
			this.saveState();
			var id = $(e.target).attr("id").split('-');
			//id[0] is vlan id, id[1] is server range id
			var vlans = this.model.get("vlaninterfaces");
			var ranges = vlans[id[0]].dhcp.ranges
        	ranges.splice(id[1],1);
        	vlans[id[0]].dhcp.ranges = ranges;     	
        	this.render();        	
    	},
    	//Add Static IP route on Vlan Interface
    	fnAddVlanStaticIp: function(e){
			e.preventDefault();
			this.saveState();			
			var id = parseInt($(e.target).attr("id"));
			var vlans = this.model.get("vlaninterfaces");
			vlans[id].staticiproute.push({'networkhost':'','subnetmask':'','gateway':'','sharevpn':false});
        	this.render();
    	},
    	//Delete Staic IP on Vlan Interface
    	fnDelVlanStaticIp: function(e){
			e.preventDefault();
			this.saveState();
			var id = $(e.target).attr("id").split('-');
			//id[0] is vlan id, id[1] is server range id
			var vlans = this.model.get("vlaninterfaces");
			var staticip = vlans[id[0]].staticiproute
        	staticip.splice(id[1],1);
        	vlans[id[0]].staticiproute = staticip;     	
        	this.render();        	
    	},
    	//Add new vlan interface
    	fnAddVlanInterface: function(e){
    		e.preventDefault();
        	this.saveState();    		
			this.model.get("vlaninterfaces").push({'id':'','config':{"type": "dhcp", "ipaddress": null, "subnetmask": null,"gateway": null,"broadcast": null},'dhcp':{},'staticiproute':[]});
        	this.render()
    		
    	},
    	//Delete Vlan interface
    	fnDelVlanInterface: function(e){
			e.preventDefault();
			this.saveState();
			var id = $(e.target).attr("id")
			//id is vlan id
			var vlans = this.model.get("vlaninterfaces");
			vlans.splice(id,1);     	
        	this.render(); 
    	},
    	//Dhcp/static toggle
    	fnSetInterfaceType: function(e){
    		//e.preventDefault();
    		this.saveState();
    		//check if main or sub interface
    		if($(e.target).attr('name').indexOf('vlan')>=0){
    			var id_arr = $(e.target).attr('name').split('[');
    			var id = parseInt(id_arr[1].replace(']',''));
    			var vlans = this.model.get("vlaninterfaces");
    			vlans[id].config.type = $(e.target).val();    			    			
    		}else{
    			this.model.get('config').type =  $(e.target).val();
    		}    		
    		this.render();
    	},
    	//Enable/disable dhcp server range
    	fnSetDhcpServer: function(e){
    		//Enable/disable only toggles the display and does not delete a range
    		this.saveState();
    		if($(e.target).attr('name').indexOf('vlan')>=0){
    			var id_arr = $(e.target).attr('name').split('[');
    			var id = parseInt(id_arr[1].replace(']',''));
    			var vlans = this.model.get("vlaninterfaces");
				if($(e.target).attr('checked')){					
    				vlans[id].dhcp.enabled = true;
				}else{
					vlans[id].dhcp.enabled = false;
				}
    		}else{
	   			if($(e.target).attr('checked')){
					this.model.get('dhcp').enabled =  true;			
				}else{
					//hide ranges
					this.model.get('dhcp').enabled =  false;
				}
    		}
    		
    		this.render();
    	},
    	
        saveState:function(){
        	this.model.set(this.cleanUpArrays(Backbone.Syphon.serialize(this)));
        },
    	   	
    	cleanUpArrays:function(model){
    		//Dhcp ranges
        	var out = new Array();
        	var ranges = model.dhcp.ranges;
        	for(var i in ranges){
        		out.push(ranges[i]);
        	}
        	model.dhcp.ranges = out;
        	//Static IP Route   
        	out = new Array();
        	var iproutes = model.staticiproute;
        	for(var j in iproutes){
        		out.push(iproutes[j]);
        	}
        	model.staticiproute = out;
        	//Vlan
        	out = new Array();
        	var vlans = model.vlaninterfaces
        	for(var k in vlans){        		
        		//clean up the dhcp
        		var vlansdhcp = vlans[k].dhcp.ranges;
        		var outvlan = new Array();
        		for(var l in vlansdhcp){
        			outvlan.push(vlansdhcp[l]);
        		}
        		vlans[k].dhcp.ranges = outvlan;
        		//clean up static ip route
        		var vlansip = vlans[k].staticiproute;
        		var outip = new Array();
        		for(var m in vlansip){
        			outip.push(vlansip[m]);
        		}
        		vlans[k].staticiproute = outip;        		
        		out.push(vlans[k]);
        	}
        	model.vlaninterfaces = out;        	
        	return model;
        } 

	});
	//define master network view
    var MasterNetworkView = Backbone.View.extend({
    	el: $("#networkinterfaces"),
    	nwView: null,

       render: function () {
            var that = this;
            _.each(this.collection.models, function (item) {
                that.renderNetwork(item);
            }, this);
        },

        renderNetwork: function (item) {
            this.nwView = new InterfaceView({
                model: item
            });
            this.$el.append(this.nwView.render().el);
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
            		$("#eachDeviceInformation").html("")
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
        	$("#firewallrules").html("");
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
        	$("#networkinterfaces").html("");
        	$("#viewNetwork .deviceNm").html(viewDeviceName);
        	this.network_router=new getNetworkUrl();
			this.network_router.fetch({
				success:function(model, response){
					networkRender.collection = new InterfaceList(response);
					networkRender.render();	
				},
				error:function(data){
					alert("Error loading json")
				}
			});
        }
        
           
    });	 
    sitesRouter = new ListOfDevRouter();   
	Backbone.history.start();
	listOfDevicesRender = new ListOfDevicesView();
	firewallRender = new MasterFirewallView();
	networkRender = new MasterNetworkView();	
});