import { FlowRouterTitle } from 'meteor/ostrio:flow-router-title'
import {Utils} from './../../utils/utils';

var title = 'Volleyball Unite';
function getCorrectHeader(){
  var header = 'header_coach';
    if(Session.get("role") == Utils.getAthleteProfile()){
      header = "header_athlete";
    }else if(Session.get("role") == Utils.getAssociationProfile()){
      header = "association_header";
    }else if(Session.get("role") == Utils.getRefreeProfile()){
      return 'referee_header';
    }else if(Session.get("role") == Utils.getRetiredProfile()){
      return 'retired_header';
    }
    return header;
}


FlowRouter.route('/create-blog', {
  action: function (params, queryParams) {
    BlazeLayout.render(getCorrectHeader(), {
      child_template_forntend: 'referee_create_blog',
    })
  },
  title(params, query, data) {
    return 'Create Blog | ' + title
  },
})

FlowRouter.route('/blog-detail/:blogId', {
  action: function (params, queryParams) {
    BlazeLayout.render(getCorrectHeader(), {
      child_template_forntend: 'referee_blog_detail',
    })
  },
  title(params, query, data) {
    return 'Blog Detail | ' + title
    //
  },
})

FlowRouter.route('/blog-detail-webview/:blogId', {
  action: function (params, queryParams) {
    BlazeLayout.render('referee_blog_detail_webview')
  },
  title(params, query, data) {
    return 'Blog Detail | ' + title
    //
  },
})

FlowRouter.route('/preview-blog-detail/:id', {
  action: function (params, queryParams) {
    BlazeLayout.render(getCorrectHeader(), {
      child_template_forntend: 'referee_preview_blog_detail',
      recent_blogs:'recent_blogs'
    })
  },
  title(params, query, data) {
    return 'Preview Blog | ' + title
    //
  },
})

FlowRouter.route('/edit-blog/:id', {
  action: function (params, queryParams) {
    BlazeLayout.render(getCorrectHeader(), {
      child_template_forntend: 'referee_edit_blog',
    })
  },
  title(params, query, data) {
    return 'Edit Blog | ' + title
    //
  },
})

FlowRouter.route('/signup-referee', {
  action: function (params, queryParams) {
    BlazeLayout.render('header-signup', {
      child_template_forntend: 'signup_referee',
    })
  },
  title(params, query, data) {
    return 'Refree | Tell Us about you | ' + title
    //
  },
})

FlowRouter.route('/referee-upload-profile-picture', {
  action: function (params, queryParams) {
    BlazeLayout.render('header-signup', {
      child_template_forntend: 'signup_coach_step_1',
    })
  },
  title(params, query, data) {
    return 'Upload Profile Picture | ' + title
    //
  },
})

FlowRouter.route('/referee-certification-level', {
  action: function (params, queryParams) {
    BlazeLayout.render('header-signup', {
      child_template_forntend: 'referee_certificate_level',
    })
  },
  title(params, query, data) {
    return 'Refree Certification | ' + title
    //
  },
})



FlowRouter.route('/blogs/:type', {
  action: function (params, queryParams) {
    BlazeLayout.render(getCorrectHeader(), {
      child_template_forntend: 'blog_listing_front',
      blog_listing_card:'blog_listing_card'
    })
  },
  title(params, query, data) {
    
    return params.type.charAt(0).toUpperCase() + params.type.slice(1) + ' Blogs | ' + title
  },
})
FlowRouter.route('/referee-profile', {
  action: function (params, queryParams) {
    BlazeLayout.render(getCorrectHeader(), {
      child_template_forntend: 'referee_profile',
      cover_image:'cover_image',
      left_panel_profile:'left_side_profile_panel' 
    })
  },
  title(params, query, data) {
    return 'Referee Profile | ' + title
  },
})

FlowRouter.route('/referee-profile/recent', {
  action: function (params, queryParams) {
    BlazeLayout.render(getCorrectHeader(), {
      child_template_forntend: 'recent_activities',
      cover_image:'cover_image',
      left_panel_profile:'left_side_profile_panel' 
    })
  },
  title(params, query, data) {
    return 'Referee Profile | Recent Activities |  ' + title
  },
})
FlowRouter.route('/referee-profile/recent/:id', {
  action: function (params, queryParams) {
    BlazeLayout.render(getCorrectHeader(), {
      child_template_forntend: 'recent_activities',
      cover_image:'view_cover_image',
      left_panel_profile:'left_side_profile_panel' 
    })
  },
  title(params, query, data) {
    return 'Referee Profile | ' + title
  },
})
FlowRouter.route('/referee-profile/:id', {
  action: function (params, queryParams) {
    BlazeLayout.render(getCorrectHeader(), {
      child_template_forntend: 'referee_profile',
      cover_image:'view_cover_image',
      left_panel_profile:'left_side_profile_panel' 
    })
  },
  title(params, query, data) {
    return 'Referee Profile | ' + title
  },
})

FlowRouter.route('/referee-profile-edit', {
  action: function (params, queryParams) {
    BlazeLayout.render(getCorrectHeader(), {
      child_template_forntend: 'referee_profile_edit',
    })
  },
  title(params, query, data) {
    return 'Referee Profile | ' + title
  },
})

FlowRouter.route('/referee-edit-personal-info', {
  action: function (params, queryParams) {
    BlazeLayout.render(getCorrectHeader(), {
      child_template_forntend: 'referee_edit_personal_info',
    })
  },
  title(params, query, data) {
    return 'Referee Profile | ' + title
  },
})

FlowRouter.route('/referee-edit-volleyball-info', {
  action: function (params, queryParams) {
    BlazeLayout.render(getCorrectHeader(), {
      child_template_forntend: 'referee_edit_volleyball_info',
    })
  },
  title(params, query, data) {
    return 'Edit Referee Profile | ' + title
  },
})

FlowRouter.route('/referee-edit-about', {
  action: function (params, queryParams) {
    BlazeLayout.render(getCorrectHeader(), {
      child_template_forntend: 'referee_edit_about',
    })
  },
  title(params, query, data) {
    return 'Edit About | ' + title
  },
})

FlowRouter.route('/referee-view-profile', {
  action: function (params, queryParams) {
    BlazeLayout.render(getCorrectHeader(), {
      child_template_forntend: 'referee_view_profile',
    })
  },
  title(params, query, data) {
    return 'Referee View Profile | ' + title
  },
})

if (Meteor.isClient) {
  new FlowRouterTitle(FlowRouter)
}
