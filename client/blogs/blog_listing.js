const axios = require('axios').default
const MiniBlogs = new Mongo.Collection(null)
import { RefereeNetwork } from '../../../../network.js/referee_network';
import { Utils } from '../../../../utils/utils';

Template.blog_listing_front.helpers({

  all: function () {
    return Session.get('ready')
  },active_cross_icon:function(){
    return Session.get("active_cross_icon");
  },'searched_query':function(){
    return FlowRouter.current().queryParams.query;
  }
  
})
Template.blog_listing_front.onRendered(function(){
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
})
Template.blog_listing_front.events({
   'click #header_draft': function (event) {
    event.preventDefault();
     if($("#search_query").val() == ""){
            window.location.href = "/blogs/draft";    
        }else{
            window.location.href = "/blogs/draft"  + "?query="  + $("#search_query").val();;
        }
  },
  'click #get_draft_blogs': function (event) {
    event.preventDefault()
     if($("#search_query").val() == ""){
            window.location.href = "/blogs/draft";    
        }else{
            window.location.href = "/blogs/draft"  + "?query="  + $("#search_query").val();;
        }
  },
  'click #get_header_all, click #header_all': function (event) {
    event.preventDefault()
     if($("#search_query").val() == ""){
            window.location.href = "/blogs/all";    
        }else{
            window.location.href = "/blogs/all"  + "?query="  + $("#search_query").val();;
        }
  },
  'click #get_header_up, click  #header_up': function (event) {
    event.preventDefault();
      if($("#search_query").val() == ""){
            window.location.href = "/blogs/coming-soon";    
        }else{
            window.location.href = "/blogs/coming-soon"  + "?query="  + $("#search_query").val();;
        }
  },
  'click #get_header_publish, click #header_pub': function (event) {
    event.preventDefault();
     if($("#search_query").val() == ""){
            window.location.href = "/blogs/published";    
        }else{
            window.location.href = "/blogs/published"  + "?query="  + $("#search_query").val();;
        }
  },
  'click #create_blog': function (event) {
    event.preventDefault()
    window.location.href = '/create-blog';
  },
  'click  #header_create': function (event) {
    event.preventDefault()
    window.location.href = '/create-blog';
  },
  'click .blog-link': function (event) {
    event.preventDefault()
    if(FlowRouter.current().params.type == "draft"){
      window.location.href = '/preview-blog-detail/' + Utils.encodeString(this.blog_id);
    }else{
      window.location.href = '/blog-detail/' + Utils.encodeString(this.blog_id);
    }
  },
  'click .edit_blog_1': function (event) {
    event.preventDefault()
    window.location.href = '/edit-blog/' + this.blog_id
  },
  
  'click .delete_blog': function (event) {
    event.preventDefault()
    let id = this._id
    Session.set('delete_blog_id', this._id)
    console.log(Session.get('delete_blog_id'), id)
  },
  "click .error-icon":function(event){
        event.preventDefault();
        window.location.href ="/blogs/"+FlowRouter.current().params.type
    },
  'keyup #search_query':function(event) {
    event.preventDefault();
    if($("#search_query").val().length == 0){
      Session.set("active_cross_icon",false);
  }else{
      Session.set("active_cross_icon",true);
  }

  if (event.which === 13 || event.keyCode === 13 || event.key === "Enter")
  {
    window.location.href ="/blogs/"+FlowRouter.current().params.type +"?query=" + $("#search_query").val();
  }
    // $('.load-more-wrap').removeClass('is-hidden')
    // MiniBlogs.remove({})
    // var search = $('#search_query').val()
    // console.log(search)
    // new RefereeNetwork()
    //   .getAllBlogDetails({ search })
    //   .then((response) => {
    //     console.log(response.data.response)
    //     var Bloglist = response.data.response
    //     MiniBlogs.insert({ Bloglist })
    //     $('.load-more-wrap').addClass('is-hidden')
    //   })
    //   .catch((err) => {
    //     console.log(err)
    //   })
  },
})
