const axios = require('axios').default
const MiniBlogsdetail = new Mongo.Collection(null)
const MiniBlogslikes = new Mongo.Collection(null)
import { RefereeNetwork } from '../../../../network.js/referee_network'
import { User } from '../../../../collections/collection'
import { Utils } from '../../../../utils/utils';
import { PopupUtils } from '../../../../utils/PopupUtils';

var id
Template.referee_preview_blog_detail.onRendered(function () {
  id = FlowRouter.getParam('id');
  id = Utils.decodedEncodedString(id);
  new RefereeNetwork()
    .getBlogDetails({ blog_id: id })
    .then((response) => {
      console.log(response.data.response[0])
      MiniBlogsdetail.insert(response.data.response[0])
      Session.set('ready', true)
    })
    .catch((err) => {
      console.log(err)
    })
})

Template.referee_preview_blog_detail.helpers({
  fetch_data_based_on_blog_id: function () {
    let blog = MiniBlogsdetail.find({}).fetch()
    return blog
  },fetch_creator_details:function(user_id){
    Meteor.subscribe('fetch_user_details',user_id);
    return User.find({user_id:user_id}).fetch()
  }
})

Template.referee_preview_blog_detail.events({
  'click #like_event': function (event) {
    event.preventDefault()
    let obj = MiniBlogslikes.find({}).fetch()
    obj[0].is_active = !obj[0].is_active
    MiniBlogslikes.update({ blog_id: obj[0].blog_id }, { $set: obj[0] })
    console.log(obj)

    new RefereeNetwork()
      .getBlogLike(obj[0])
      .then(function (response) {
        console.log(response.data)
      })
      .catch(function (error) {})
  },
  // 'click #submit_report_as_abuse': function (event) {
  //   event.preventDefault()

  //   // var val1 = $("#styled-checkbox-2").val().trim();
  //   var val1 = $('#styled-checkbox-2:checked').val()

  //   var val2 = $('#styled-checkbox-3:checked').val()

  //   var val3 = $('#styled-checkbox-4:checked').val()

  //   if (val3 == undefined && val1 == undefined && val2 == undefined) {
  //     $('#invalid_title').removeClass('display_hidden')
  //     return false
  //   } else {
  //     if (!$('#invalid_title').hasClass('display_hidden'))
  //       $('#invalid_title').addClass('display_hidden')
  //   }

  //   let obj = {}
  //   obj.reason1 = val1
  //   obj.reason2 = val2
  //   obj.reason3 = val3
  //   obj.content_type = 'BLOG'
  //   obj.is_reported_as_abuse = true
  //   obj.post_id = getBlogId()
  //   obj.user_id = localStorage.getItem('_id')

  //   console.log('obj', obj)

  //   $('#loader_span').removeClass('display_none_class')
  //   axios
  //     .post(Utils.getUrl() + 'create_report_as_abuse', obj)
  //     .then(function (response) {
  //       // handle success
  //       console.log(response)
  //       if (response.data.code == 200) {
  //         cover_image = ''
  //         // localStorage.setItem("_id",response.data._id);
  //         toastr.success(response.data.message)
  //         //window.location.href=response.data.redirect_url;
  //       } else {
  //         toastr.warning(response.data.message)
  //       }
  //     })
  //     .catch(function (error) {
  //       // handle error
  //       console.log(error)
  //     })
  //     .then(function () {})
  // },
  'click #create_blog': function (event) {
    event.preventDefault()
    window.location.href = '/create-blog'
  },
  'click #edit_blog': function (event) {
    event.preventDefault()
       var encrypted = FlowRouter.current().params.id;
 window.location.href =
      '/edit-blog/' +encrypted;
  },
  'click #report_abuse': function () {
    $('.report-abuse-modal').addClass('is-active')
  },
  'click #publish': function () {

    var userId = localStorage.getItem('_id')
    new RefereeNetwork()
      .editBlog({
        blog_id: Utils.decodedEncodedString(FlowRouter.current().params.id),
        user_id: userId,
        status: true,
      })
      .then(function (data) {
        
        PopupUtils.showSuccessPopup('Published!');

        var blog_id = data.data.response2[0].blog_id;
        var encrypted = Utils.encodeString(blog_id);
        window.location.href = `/blog-detail/${encrypted}`;
      })
  },
  'click #edit-back': function () {
        var encrypted = FlowRouter.current().params.id;
 window.location.href =
      '/edit-blog/' +encrypted;
  },
})
