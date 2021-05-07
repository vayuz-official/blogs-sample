const axios = require("axios").default;
import { RefereeNetwork } from "../../../../network.js/referee_network";
import { Utils } from "../../../../utils/utils";
import {
  User,
  MiniBlogsdetail,
  MiniBlogslikes,
  UserComments,
  FeedLikes,
} from "../../../../collections/collection";
import { FeedOperations } from "../../../../utils/FeedOperations";

var id;
Template.referee_blog_detail.onRendered(function () {
  Session.set("likeApiCalled", false);
  id = FlowRouter.getParam("blogId");
  id = Utils.decodedEncodedString(id);
  new RefereeNetwork()
    .getBlogDetails({ blog_id: id, user_id: Utils.getLoggedInUserId() })
    .then((response) => {
      MiniBlogsdetail.insert(response.data.response[0]);
      Session.set("ready", true);
      setTimeout(function () {
        Utils.loadDropdowns();
      }, 2000);
    })
    .catch((err) => {
      console.log(err);
    });
});

report_abuse = (reason) => {
  console.log(reason);
};

Template.referee_blog_detail.helpers({
  fetch_like_collection: function () {
    let like = MiniBlogslikes.find({}).fetch();
    console.log(like[0].is_active);
    return like[0].is_active;
  },

  fetch_data_based_on_blog_id: function () {
    let blog = MiniBlogsdetail.find({}).fetch();
    return blog;
  },
  fetch_creator_details: function (user_id) {
    Meteor.subscribe("fetch_user_details", user_id);
    return User.find({ user_id: user_id }).fetch();
  },
  created_by: function () {
    let blog = MiniBlogsdetail.find({}).fetch();
    console.log(blog[0].user_id);
    return blog[0].user_id;
  },
  logged_in_user: function () {
    var id = Utils.getLoggedInUserId();
    return id;
  },
  like_api_called:function(){
    return Session.get("likeApiCalled");
  }
});

function configureLoader(id1, b) {
  if (b) {
    $(id1).removeClass("display_hidden");
  } else {
    $(id1).addClass("display_hidden");
  }
}

function removeBlog(b, blog_id, loader_id) {
  configureLoader(loader_id, true);
  var obj = {};
  obj.user_id = Utils.getLoggedInUserId();
  obj.blog_id = blog_id;
  axios
    .post(Utils.getUrl() + "remove_blog", obj)
    .then(function (response) {
      configureLoader(loader_id, false);
      if (response.data.code == 200) {
        window.location.href = "/blogs/all";
      }
    })
    .catch(function (error) {
      //   PopupUtils.showErrorPopupWithMessage("Internet connectivity Issue");
    });
}
Template.referee_blog_detail.events({
  "click #like_count": async function (event) {
    event.preventDefault();
    event.stopPropagation();
    if(this.is_creator.length==0){
  
    }else{
      if(this.total_likes>=0){
        var obj = {};
        obj.user_id = Utils.getLoggedInUserId();
        obj.post_id = this.blog_id;
        FeedLikes._collection.remove({});
        var result = await FeedOperations.fetchAllLikes(obj);
        if (result.data.code == 200) {
          for (var i = 0; i < result.data.all_likes.length; i++) {
            FeedLikes.insert(result.data.all_likes[i].user_details[0]);
          }
          $("#all_likes_modal").addClass("is-active");
        } else {
          PopupUtils.showErrorPopupWithMessage("Something went wrong");
        }
      }
    }
    
  },

  "click #confirm_remove": function (event) {
    event.preventDefault();
    removeBlog(false, Session.get("removingBlogId"), "#remove_blog_loader");
  },
  "click #delete_blog": function (event) {
    event.preventDefault();
    Session.set("removingBlogId", this.blog_id);
    $("#blog_name_headline").text("Remove " + this.title + "?");
    $("#remove-modal").addClass("is-active");
  },
  "click .close-modal": function (event) {
    event.preventDefault();
    $("#remove-modal").removeClass("is-active");
    $("#all_likes_modal").removeClass("is-active");
  },
  "click .modal-background": function (event) {
    event.preventDefault();
    $("#all_likes_modal").removeClass("is-active");
    $("#remove-modal").removeClass("is-active");
  },
  "click #like_event": function (event) {
    event.preventDefault();
    if (Session.get("likeApiCalled") == false) {
      var obj = {};
      obj.user_id = localStorage.getItem("_id");
      id = FlowRouter.getParam("blogId");
      id = Utils.decodedEncodedString(id);
      obj.post_id = id;
      obj.liked = !this.user_liked;


      var currentCount = MiniBlogsdetail.find({ blog_id: obj.post_id }).fetch();
      var total_likes = 0;
      if (obj.liked) {
        total_likes = currentCount[0].total_likes + 1;
      } else {
        total_likes = currentCount[0].total_likes - 1;
      }
      if (total_likes >= 0) {
        MiniBlogsdetail._collection.update(
          { blog_id: obj.post_id },
          { $set: { total_likes: total_likes } }
        );
      }

      axios
        .post("/likeEventOnBlog", obj)
        .then(function (response) {
          if (response.data.code == 200) {
            MiniBlogsdetail._collection.update(
              { blog_id: obj.post_id },
              { $set: { user_liked: obj.liked, updated_at: Date.now() } }
            );
            setTimeout(function () {
              Session.set("likeApiCalled", false);
            }, 200);
          }
        })
        .catch(function (error) {
          //   PopupUtils.showErrorPopupWithMessage("Internet connectivity Issue");
        });

      Session.set("likeApiCalled", true);
      Utils.likeEventOnFeed(obj);
    }
  },

  "click #report_blog_abuse": function (event) {
    event.preventDefault();
    $("#report_abuse-modal").addClass("is-active");
    Session.set("reportedFeedPostId", this.blog_id);
    Session.set("reportedPostType", "blog");
  },
  "click #abuse-reason1": function () {
    var val1 = $("#abuse-reason1").text();
    $("#report-abuse-modal").removeClass("is-active");
    report_abuse(val1);
  },
  "click #abuse-reason2": function () {
    var val2 = $("#abuse-reason2").text();
    $("#report-abuse-modal").removeClass("is-active");
    report_abuse(val2);
  },
  "click #abuse-reason3": function () {
    var val3 = $("#abuse-reason3").text();
    $("#report-abuse-modal").removeClass("is-active");
    report_abuse(val3);
  },

  // if (val3 == undefined && val1 == undefined && val2 == undefined) {
  //   $('#invalid_title').removeClass('display_hidden')
  //   return false
  // } else {
  //   if (!$('#invalid_title').hasClass('display_hidden'))
  //     $('#invalid_title').addClass('display_hidden')
  // }

  // let obj = {}
  // obj.reason1 = val1
  // obj.reason2 = val2
  // obj.reason3 = val3
  // obj.content_type = 'BLOG'
  // obj.is_reported_as_abuse = true
  // obj.post_id = getBlogId()
  // obj.user_id = localStorage.getItem('_id')

  // console.log('obj', obj)

  // $('#loader_span').removeClass('display_none_class')
  // axios
  //   .post(Utils.getUrl() + 'create_report_as_abuse', obj)
  //   .then(function (response) {
  //     // handle success
  //     console.log(response)
  //     if (response.data.code == 200) {
  //       cover_image = ''
  //       // localStorage.setItem("_id",response.data._id);
  //       toastr.success(response.data.message)
  //       //window.location.href=response.data.redirect_url;
  //     } else {
  //       toastr.warning(response.data.message)
  //     }
  //   })
  //   .catch(function (error) {
  //     // handle error
  //     console.log(error)
  //   })
  //   .then(function () {})
  "click #create_blog": function (event) {
    event.preventDefault();
    window.location.href = "/create-blog";
  },
  "click #edit_blog": function (event) {
    event.preventDefault();
    window.location.href = "/edit-blog/" + FlowRouter.current().params.blogId;
  },
  "click .edit_blog": function (event) {
    event.preventDefault();
    window.location.href = "/edit-blog/" + FlowRouter.current().params.blogId;
  },

  "click #share_model": function (event) {
    event.preventDefault();
    $("#share-modal").addClass("is-active");
  },
  "click .modal-background": function (event) {
    event.preventDefault();

    $("#share-modal").removeClass("is-active");
  },
  "click .close-modal": function (event) {
    event.preventDefault();
    $("#share-modal").removeClass("is-active");
  },

  "click #delete_blog_new": function (event) {
    event.preventDefault();
    Session.set("removingBlogId", this.blog_id);
    $("#blog_name_headline").text("Remove " + this.title + "?");
    $("#remove-modal").addClass("is-active");
  },
});
