import axios from 'axios'
import { RefereeNetwork } from '../../../../network.js/referee_network'
import { Utils } from '../../../../utils/utils'
import { PopupUtils } from '../../../../utils/PopupUtils';

var description = ''
Template.referee_create_blog.onRendered(function () {
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
  configureDatePicker();
})
function configureDatePicker(){
    
	var today = Utils.getTodaysDate();
	bulmaCalendar.attach('#publish-date', {
		type: 'date',
		dateFormat: 'DD/MM/YYYY',
    showHeader:false,
    placeholder:"Enter Publish Date",
		showFooter: false,
		minDate: today.toString(),
	});
}

Template.referee_create_blog.events({
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
  
  'keyup #editor': function (event) {
    description = $('.ql-editor').html()
  },
  'click #draft': function () {
    event.preventDefault()
    var userId = Utils.getLoggedInUserId();
    var bannerimage = ''
    var fileinput = document.querySelector('#banner-image')
    var publishdate = $('.datetimepicker-dummy-input').val().trim()
    var title = $('#blog-title').val().trim()
    var coverImage = $(".cover-image").attr("src");
    if(coverImage== "https://via.placeholder.com/1600x460"){
      sweetAlert('Please upload any banner image');
      return false;
    }
    publishdate = publishdate.split('/')
    if(publishdate.length==3){
      var newDate = publishdate[1] + '/' + publishdate[0] + '/' + publishdate[2]
      publishdate = new Date(newDate).getTime()
    }
   
    bannerimage = coverImage;
    new RefereeNetwork()
    .createBlog({
      user_id: userId,
      user_type: Session.get("role"),
      title: title,
      desc: description,
      status: false,
      banner_image: bannerimage,
      publish_date: publishdate,
    })
    .then(function (data) {
      console.log(data)
      PopupUtils.showSuccessPopup('Saved to draft')
      return FlowRouter.go(`/blogs/all`);
    })
  },
  'click #preview-publish': function () {
    event.preventDefault()
    var userId = Utils.getLoggedInUserId()
    var bannerimage = ''
    var title = $('#blog-title').val().trim()
    var fileinput = document.querySelector('#banner-image')
    var publishdate = $('#publish-date').val().trim()
   
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
    publishdate = publishdate.split('/')
    if(publishdate.length==3){
      var newDate = publishdate[1] + '/' + publishdate[0] + '/' + publishdate[2]
      publishdate = new Date(newDate).getTime()
    }


    bannerimage = coverImage;
    
      new RefereeNetwork()
        .createBlog({
          user_id: userId,
          user_type: 'referee',
          title: title,
          desc: description,
          status: false,
          banner_image: bannerimage,
          publish_date: publishdate,
        })
        .then(function (data) {
          console.log(data)
          PopupUtils.showSuccessPopup('Blog Created!')
          var blogId = Utils.encodeString(data.data.response2[0].blog_id);
          return FlowRouter.go(
            `/preview-blog-detail/${blogId}`,
          )
        })
  },
})
