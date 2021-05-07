import axios from 'axios'
const Mini_referee_blog = new Mongo.Collection(null)
import { RefereeNetwork } from '../../../../network.js/referee_network'
import { PopupUtils } from '../../../../utils/PopupUtils';
import { Utils } from '../../../../utils/utils';

var description = ''
var id
var banner_image;


Template.referee_edit_blog.onRendered(function () {
  var quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['link', 'image'],
        ['clean'],
      ],
    },
    placeholder: 'Enter Description here....',
  })
  id = FlowRouter.getParam('id')
  id= Utils.decodedEncodedString(id);
  new RefereeNetwork()
    .getBlogDetails({
      blog_id: id,
    })
    .then(function (data) {
      console.log(data.data.response[0])
      Mini_referee_blog.insert(data.data.response[0])
      banner_image = data.data.response[0].banner_image
      var text = data.data.response[0].desc.replace(/<\/?[^>]+>/gi, '')
      quill.setText(text)
      let a = Mini_referee_blog.find({}).fetch();
      if(!data.data.response[0].status){
          configureDatePicker(data.data.response[0].publish_date);
      }else{
        data.data.response[0].publish_date = Utils.convertTimeStampToDate(data.data.response[0].publish_date)
        $("#publish-date").attr("disabled",true);
        $("#when_to_publish_div").addClass("display_hidden")
        // alert(Utils.convertTimeStampToDate(data.data.response[0].publish_date));
      }
      console.log(a)
    })
    .catch((error) => console.log('error', error))
})

function configureDatePicker(date){
	bulmaCalendar.attach('#publish-date', {
		type: 'date',
		dateFormat: 'DD/MM/YYYY',
    showHeader:false,
    placeholder:"Enter Publish Date",
		showFooter: false,
		minDate: date.toString(),
	});
  
  $(".datetimepicker-dummy-input").val(Utils.getDateInDDMMYYYYFormat(date));
  // setTimeout(function(){
  //          $(".datetimepicker-dummy-input").click();
  // },200);
}

Template.referee_edit_blog.helpers({
  data: function () {
    var data = Mini_referee_blog.find({}).fetch()

    return data[0]
  },
})

Template.referee_edit_blog.events({
  "click .cover-edit":function(event){
    event.preventDefault();
    $("#change-cover-modal").addClass("is-active")
},
"click .close-modal":function(event){
    event.preventDefault();
    $("#change-cover-modal").removeClass("is-active")
    
},"click .modal-background":function(event){
    event.preventDefault();
    $("#change-cover-modal").removeClass("is-active")
    
},
"click #submit-cover-picture":function(event){
    event.preventDefault(); 
    setTimeout(function(){
        if($("#change-cover-modal").hasClass("is-active")){
            $("#change-cover-modal").removeClass("is-active")
        }
        var coverSrc = Session.get("croppedImageSrc");
        var form = new FormData();
        form.append("files", Utils.dataURItoBlob(coverSrc));
        $(".cover-image").attr("src",coverSrc);

        var settings = {
        "async": true,
        "crossDomain": true,
        "url": "/upload_files_content",
        "method": "POST",
        "headers": {
            "cache-control": "no-cache",
            "postman-token": "7b3b1271-07c8-2c13-4bd2-ee8ef740bf5f"
        },
        "processData": false,
        "contentType": false,
        "mimeType": "multipart/form-data",
        "data": form
        }
        
        $.ajax(settings).done(function (response) {
            console.log(response);
            response = JSON.parse(response);
            $(".cover-image").attr("src", Utils.getS3Suffix() +  response.s3_url);
        });
    },1000);
},
  

  'click #back-to-blogs': function () {
    // return FlowRouter.go(`/blogs/all`)
    history.back();
  },

  'keyup #editor': function (event) {
    description = $('.ql-editor').html()
  },
  'click #draft': function () {
    event.preventDefault()
    var userId = Utils.getLoggedInUserId();
    var fileinput = document.querySelector('#banner-image');
    description = $('.ql-editor').html()
    var publishdate = $('#publish-date').val().trim()
    var title = $('#blog-title').val().trim()
    publishdate = publishdate.split('-')
    var newDate = publishdate[1] + '/' + publishdate[2] + '/' + publishdate[0]
    publishdate = new Date(newDate).getTime()
    console.log(publishdate)

    var coverImage = $(".cover-image").attr("src");
    if(coverImage== "https://via.placeholder.com/1600x460"){
      sweetAlert('Please upload any banner image');
      return false;
    }
    bannerimage = coverImage;
      new RefereeNetwork()
        .editBlog({
          blog_id: id,
          user_type: Session.get("role"),
          user_id: userId,
          title: title,
          desc: description,
          status: false,
          banner_image: bannerimage,
          publish_date: publishdate,
        })
        .then(function (data) {
          console.log(data)
          PopupUtils.showSuccessPopup('Blog is saved in draft')
           FlowRouter.go(`/blogs/draft`);
        })
    
  },
  'click #preview-publish': function () {
    event.preventDefault()
    var userId = Utils.getLoggedInUserId();
    var title = $('#blog-title').val().trim()
    description = $('.ql-editor').html()
    var fileinput = document.querySelector('#banner-image')
    var publishdate = $('#publish-date').val().trim()
    publishdate = publishdate.split('-')
    var newDate = publishdate[1] + '/' + publishdate[2] + '/' + publishdate[0]
    publishdate = new Date(newDate).getTime()
    console.log(publishdate)

    if (title != '') {
      $('#invalid-title').addClass('display_hidden')
    } else {
      $('#invalid-title').removeClass('display_hidden')
      PopupUtils.showInfoPopup('Please Enter Title')
      return false
    }

    if (publishdate != '') {
      $('#invalid-date').addClass('display_hidden')
    } else {
      $('#invalid-date').removeClass('display_hidden')
      PopupUtils.showInfoPopup('Please Enter Date')
      return false
    }
    if (description == '') {
      $('#invalid-description').removeClass('display_hidden')
      PopupUtils.showInfoPopup('Please Enter Description')
      return false
    } else {
      $('#invalid-description').addClass('display_hidden')
    }

    var coverImage = $(".cover-image").attr("src");
    if(coverImage== "https://via.placeholder.com/1600x460"){
      sweetAlert('Please upload any banner image');
      return false;
    }
    bannerimage = coverImage;
    new RefereeNetwork()
      .editBlog({
        user_id: userId,
        blog_id: id,
        user_type: Session.get("role"),
        title: title,
        desc: description,
        status: true,
        banner_image: bannerimage,
        publish_date: publishdate,
      })
      .then(function (data) {
        // console.log(data)  
        PopupUtils.showSuccessPopup('Successfully Published')
        var bId = Utils.encodeString(data.data.response2[0].blog_id);
        window.location.href = `/blog-detail/${bId}`
      })
  },
})
