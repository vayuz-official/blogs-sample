const axios = require('axios').default
// const profilepic = new Mongo.Collection(null)
import { RefereeNetwork } from '../../../../network.js/referee_network'
import { MiniBlogs } from '../../../../collections/collection.js'
import { Utils } from '../../../../utils/utils';
var limit =0;
var apiCalling=false;
Template.blog_listing_card.onRendered(function(){
  Session.set('ready', false)
   fetchAllBlogs(limit);
});

Template.blog_listing_card.onDestroyed(function(){
          MiniBlogs._collection.remove({});
})
function fetchBlogsCount(){
  var obj = {};
   obj.user_id = Utils.getLoggedInUserId();
   obj.query = FlowRouter.current().queryParams.query;
   if(obj.query == undefined){
      Session.set("active_cross_icon",false);
   }else if(obj.query !=undefined && obj.query.length == 0){
      Session.set("active_cross_icon",true);
  }else{
      Session.set("active_cross_icon",false);
  }
    new RefereeNetwork()
    .getAllBlogsCount(obj)
    .then((response) => {
      if(response.data.result){
        $(".all_blogs_count").text("All (" +response.data.result.all_blogs + ")");
        $(".all_draft_count").text("Draft (" +  response.data.result.draft + ")");
        $(".all_upcoming_count").text("Upcoming ("+ response.data.result.upcoming+ ")");
        $(".all_published_count").text("By me (" + response.data.result.published  + ")");
      }
     
    })
    .catch((err) => {
      console.log(err)
    })
}

function fetchAllBlogs(limit){
  var obj = {};
   obj.user_id = Utils.getLoggedInUserId();
   obj.query = FlowRouter.current().queryParams.query;
   obj.type = FlowRouter.current().params.type;
   obj.limit = limit;

   if(obj.query == undefined){
      Session.set("active_cross_icon",false);
   }else  if(obj.query !=undefined && obj.query.length == 0){
      Session.set("active_cross_icon",true);
  }else{
      Session.set("active_cross_icon",false);
  }
    new RefereeNetwork()
    .getAllBlogDetails(obj)
    .then((response) => {
      console.log(response);
      var bloglist = response.data.response;
      for(var i=0;i<bloglist.length;i++){
        MiniBlogs.insert(bloglist[i]);
      }
      Session.set('ready', true);
      $('.load-more-wrap').addClass('is-hidden');
      Session.set("pagination_loading",false);
      Session.set('total_blogs',response.data.total_blogs)
      scrollToBottom();
    })
    .catch((err) => {
      console.log(err)
    })
}




function configureLoader(id1,b){
  
  if(b){
    $(id1).removeClass("display_hidden");
  }else{
    $(id1).addClass("display_hidden");
  }
}

function removeBlog(b,blog_id,loader_id){
  configureLoader(loader_id,true);
  var obj = {};
    obj.user_id = Utils.getLoggedInUserId();
    obj.blog_id = blog_id;
    axios.post(Utils.getUrl()+'remove_blog',obj)
    .then(function (response) {
    configureLoader(loader_id,false)
    if(response.data.code==200){
      $("#remove-modal").removeClass('is-active'); 
      MiniBlogs._collection.remove({blog_id:blog_id});
      Session.set("total_blogs",Session.get("total_blogs")-1); 
      fetchBlogsCount();
    }
    })
    .catch(function (error) {
    //   PopupUtils.showErrorPopupWithMessage("Internet connectivity Issue");
    });
}

function scrollToBottom(){
  window.onscroll = function() {
    var scrollHeight, totalHeight;
    scrollHeight = document.body.scrollHeight;
    totalHeight = window.scrollY + window.innerHeight;
    if(totalHeight >= scrollHeight)
    {
        if(limit<Session.get("total_blogs")){
          if(apiCalling == false){
            limit  = limit + 8;
            Session.set("pagination_loading",true);
            fetchAllBlogs(limit);
          }    
      }                  
    }
  }
}

Template.registerHelper('get_total_blogs',function(){
  return Session.get("total_blogs")
})
Template.registerHelper('check_if_active_blog_type',function(type){
  return FlowRouter.current().params.type == type;
})

Template.blog_listing_card.helpers({
  isReady:function(){
    return Session.get('ready');
  },
  fetch_all_blogs: function () {
        let blogsList = MiniBlogs.find({}).fetch()
        return blogsList;
  },'searched_query':function(){
    return FlowRouter.current().queryParams.query;
  },
  pagination_loading:function(){
    return Session.get("pagination_loading");
  },active_cross_icon:function(){
    return Session.get("active_cross_icon");
  }
})

Template.blog_listing_card.events({
  "click .redirect_to_profile":function(event){
    event.preventDefault()
    Utils.openUserProfile(this.user_type,this.user_id,true,this.name);
  },
  "click #confirm_remove":function(event){
    event.preventDefault();
   removeBlog(false,Session.get("removingBlogId"),"#remove_blog_loader");
  },
 'click #delete_blog':function(event){
    event.preventDefault();
    Session.set("removingBlogId",this.blog_id);
    $("#blog_name_headline").text("Remove "+ this.title+"?");
    $("#remove-modal").addClass('is-active');
  },
  "click .close-modal":function(event){
    event.preventDefault();
    $("#remove-modal").removeClass("is-active");
  },
  "click #edit-blog":function(event){
    event.preventDefault();
    window.location.href = '/edit-blog/' + Utils.encodeString(this.blog_id);
  },
  "click #report_abuse_trigger":function(event){
    event.preventDefault();
      $("#report_abuse-modal").addClass("is-active");
      Session.set("reportedFeedPostId", this.blog_id);
      Session.set("reportedPostType",'blog');
    },
})