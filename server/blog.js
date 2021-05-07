import express from 'express'
import { Meteor } from 'meteor/meteor'
const app = express()
const bodyParser = require('body-parser')
var Fiber = require('fibers')
var md5 = require('md5')
import {
  Blogs,
  Likes,
  User,
  UserComments,
  Feed,
  AbusivePosts,
  Followers
} from '../../collections/collection.js'

app.use(express.json())
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
)

app.post('/api/referee_create_blog', (req, res) => {
  var date = Date.now()
  var bloglikes = {}
  var obj = req.body
  obj.created_at = date
  obj.blog_id = 'blog_' + date
  obj.user_id = req.body.user_id
  bloglikes.blog_id = 'blog_' + date
  bloglikes.user_id = req.body.user_id
  bloglikes.is_active = false
  bloglikes.post_type = 'blog_post'
  bloglikes.last_updated_date = date
  Fiber(function () {
    var obj1=req.body;
    obj1.is_active = true; 
    let response = Blogs.insert(obj1);
    if (response) {
      Likes.insert(bloglikes);
      var publishingDate=req.body.publish_date; 
      if(Date.now() - req.body.publish_date< 86400000 ){
        publishingDate = Date.now();
      }      
      let response2 = Blogs.find({ blog_id: obj.blog_id }).fetch()
      return res.status(200).send({ response2 })
    } else {
      //
      return res.status(404).send({ status: 404, message: 'Data Not Found' })
    }
  }).run()
})

app.post('/api/get_blog_details', async (req, res) => {
  Fiber(async function () {
    var user_id = req.body.user_id;
    let response = await Blogs.rawCollection().aggregate([
         { 
            $match:{
              blog_id: req.body.blog_id
            }
          },
         {
          $lookup: {
            from: "blogs",
            let: {
              blog_id: "$blog_id",
              user_id: user_id,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$$blog_id", "$blog_id"],
                      },
                      { $eq: ["$$user_id", "$user_id"] },
                    ],
                  },
                },
              },
            ],
            as: "is_creator",
          },
        },
        {
          $lookup: {
            from: "followers",
            let: {
              follower_of: "$user_id",
              user_id: user_id,
              // user_type: "USER",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$$follower_of", "$follower_of"] },
                      { $eq: ["$$user_id", "$user_id"] },
                      { $eq: [true, "$is_active"] },
                      // { $eq: ["$$user_type", "$user_type"] },
                    ],
                  },
                },
              },
            ],
            as: "is_follower",
          },
        },
        {
          $lookup: {
            from: "followers",
            let: {
              follower_of: user_id,
              user_id: "$user_id",
              // user_type: "USER",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$$follower_of", "$follower_of"] },
                      { $eq: ["$$user_id", "$user_id"] },
                      { $eq: [true, "$is_active"] },
                      // { $eq: ["$$user_type", "$user_type"] },
                    ],
                  },
                },
              },
            ],
            as: "is_following",
          },
        },
    ]).toArray()
    if (response) {
      var dat, month
      var obj = response
      if(response[0] && response[0].publish_date){
        var d = new Date(response[0].publish_date)
      if (d.getMonth() + 1 <= 9 && d.getMonth() != 9) {
        month = '0' + (d.getMonth() + 1)
        dat = '0' + d.getDate()
        if (d.getDate() <= 9) {
          dat = '0' + d.getDate()
        }
      } else if (d.getDate() <= 9) {
        month = d.getMonth() + 1
        dat = '0' + d.getDate()
      } else {
        month = d.getMonth() + 1
        dat = d.getDate() + ''
      }
      var finaldate = d.getFullYear() + '-' + month + '-' + dat
      obj[0].publish_date = finaldate;
      }
      
        var query = {
          post_id:req.body.blog_id,
          user_id:req.body.user_id,
          is_active:true
      }

      var likeCount = Likes.find(query).count();
      if(response[0]){
        response[0].user_liked = likeCount>0;
        delete query['user_id'];
        response[0].total_likes = Likes.find(query).count();
      }
      
      var checkAllAbusivePosts = AbusivePosts.find({
          $or: [
            {
              user_id: user_id,
              post_type: "comment",
              status: {
                $in: [0, 1],
              },
            },
            {
              post_type: "comment",
              status: {
                $in: [1],
              },
            },
          ],
        }).fetch();

        var allAbusivePosts = [];
        for (var i = 0; i < checkAllAbusivePosts.length; i++) {
          allAbusivePosts.push(checkAllAbusivePosts[i].post_id);
        }
        // console.log(checkAllAbusivePosts);
       var total_comments = UserComments.find({
                post_id: req.body.blog_id,
                comment_id: {
                  $nin: allAbusivePosts,
                },
                is_active: true,
              }).count();
              
      response[0].total_comments =  total_comments;

      // console.log(response);
      return res.status(200).send({ response })
    } else {
      //
      return res.status(404).send({ status: 404, message: 'Data Not Found' })
    }
  }).run()
})

app.post('/api/referee_edit_blog', (req, res) => {
  var obj = req.body
  obj.updated_at = Date.now()
  Fiber(function () {
    let response = Blogs.update(
      { blog_id: req.body.blog_id },
      { $set: obj },
    )
    if (response) {
      let response2 = Blogs.find({ blog_id: req.body.blog_id }).fetch()
    var obj1 = {
        'feed_id': 'feed_id_' + Date.now(),
        'is_active': true,
        'metadata_post': false,
        'special_post': true,
        'blog_id': obj.blog_id,
        'special_post_type': 'blog',
        'created_at': response2[0].publish_date,
        'created_by': obj.user_id,
        'total_likes':0,
        'total_comments':0,    
        'metadata_details': {}, 
        'post_images':[],
    };
      Feed.insert(obj1);

      return res.status(200).send({ response2 })
    }
  }).run()
})

app.post('/remove_blog',  (req, res) => {
  Fiber(async function() {
    
      var user_id = req.body.user_id;
      var blog_id = req.body.blog_id;
        var result = {};
      var query = {
          blog_id:blog_id,
          user_id:user_id,
          // is_active:true
      }
      var checkIfExists = Blogs.find(query).fetch();
      if(checkIfExists.length == 0){
        result.code = 300;
        result.message = "Such blog not found.";
      }else if(checkIfExists.length != 0 ){
        Blogs.update(query,{$set: {is_active:false,updated_at:Date.now()}});
        Feed.update({special_post:true,blog_id: query.blog_id, },{$set:{is_active:false,updated_at:Date.now()}})
        result.code = 200;
        result.message = "Blog removed Successfully.";
      }   

      return res.status(200).send(result);
      }).run();
  });


function fetchQuery(type,searchQuery, user_id,blog_detail_page_id){
  let todayDate =Date.now()
  const query = new RegExp(searchQuery,'i');  



    var checkAllAbusivePosts = AbusivePosts.find({user_id:user_id, post_type:'blog', status:{$in:[0,1]}}).fetch();
    var allAbusivePosts = [];
    for(var i=0;i<checkAllAbusivePosts.length;i++){
      allAbusivePosts.push(checkAllAbusivePosts[i].post_id);
    }
    if(blog_detail_page_id!="" && blog_detail_page_id!=undefined){
     allAbusivePosts.push(blog_detail_page_id); 
    }
    var allFollowers = Followers.find({$and:[{  $or: [{ follower_of: user_id}, { user_id : user_id}  ], },{ is_active:true },{status : 1} ], },{sort: {created_at: -1}}).fetch();
    
    var allNetworkUsers = []
    for(var i=0;i<allFollowers.length;i++){
        var userIdToCheck = allFollowers[i].user_id;
        if(user_id == allFollowers[i].user_id){
            userIdToCheck  = allFollowers[i].follower_of;
        }
       allNetworkUsers.push(userIdToCheck);
    }
    allNetworkUsers.push(user_id);

  if(type == "all"){
   return  {
      $match: {
        $and: [
          { status: true },
          {is_active:true},
          { publish_date: { $lte: todayDate } },
          { title: query },
          { blog_id:{$nin:allAbusivePosts}},
          // { is_active:true},
          {$or:[{
            user_id:{$in : allNetworkUsers}
          },{
            is_created_by_admin:true
          }]}
          
        ],
      },
    };
    }else if(type == "draft"){
        return {
                $match:{
                    $and: [
                      { status: false },
                      { user_id: user_id },
                      {is_active:true},
                      { title: query },
                       // { is_active:true},
                      { blog_id:{$nin:allAbusivePosts}}
                    ],
                }
              };
     }else if(type == "coming-soon"){
       return {
         $match:{
          $and: [
            { status: true },
            {is_active:true},
            { publish_date: { $gt: todayDate } },
            { title: query },
            { user_id: user_id },
             // { is_active:true},
            { blog_id:{$nin:allAbusivePosts}}
          ],
        }
       }
     }else{
       return {
         $match:{
          $and: [
            { status: true },
            {is_active:true},
            { publish_date: { $lte: todayDate } },
            { user_id: user_id },
            { title: query },
             // { is_active:true},
            {blog_id:{$nin:allAbusivePosts}}
          ],
        }
       }
     }
}
app.post('/api/get_blogs', (req, res) => {
 

    Fiber(function () {
      var searchQuery = req.body.query;
      var type = req.body.type;
      var user_id = req.body.user_id;

      var limit = req.body.limit;        
      var max = 0;        
      if(limit == undefined){
          limit = 0;
          max = 1000;
      }else{
          max = 8;
      }
      let response = Promise.await(
        Blogs.rawCollection().aggregate([
          fetchQuery(type,searchQuery,user_id,""),
          {
            $lookup: {
              from: 'user',
              localField: 'user_id',
              foreignField: 'user_id',
              as: 'user_data',
            },
          },
          {
            $sort: {
              created_at: -1,
            },
          },
          {
              $limit: max + limit
          },
          {
              $skip: limit
          },  
          {
            $project: {
              'user_data.password': 0,
            },
          },

        ]).toArray(),
      )
        var result = {};
        result.response = response;
        result.code  = 200;

          let total_blogs = Promise.await(
            Blogs.rawCollection().aggregate([
          fetchQuery(type,searchQuery,user_id,""),
          {
            $lookup: {
              from: 'user',
              localField: 'user_id',
              foreignField: 'user_id',
              as: 'user_data',
            },
          },
          {
            $sort: {
              created_at: -1,
            },
          },
        ]).toArray());

        result.total_blogs =total_blogs.length 
        return res.status(200).send(result)
      // }
    }).run()
})

app.post('/api/fetch_recent_blogs', (req, res) => {
 

    Fiber(function () {
      var searchQuery = req.body.query;
      var type = req.body.type;
      var user_id = req.body.user_id;
      var blog_detail_page_id = req.body.blog_detail_page_id;

      
      let response = Promise.await(
        Blogs.rawCollection().aggregate([
          fetchQuery(type,searchQuery,user_id,blog_detail_page_id),
          {
            $lookup: {
              from: 'user',
              localField: 'user_id',
              foreignField: 'user_id',
              as: 'user_data',
            },
          },
          {
            $sort: {
              created_at: -1,
            },
          },
          {
              $limit: 3
          },
         
          {
            $project: {
              'user_data.password': 0,
            },
          },

        ]).toArray(),
      )

      // if (response.length > 0)
      var result = {};
       result.data= response;
       result.status = 200;
        return res.status(200).send(result);
      // }
    }).run()
})
app.post('/api/get_all_blogs_count', (req, res) => {
 

    Fiber(function () {
      var searchQuery = req.body.query;
      var user_id = req.body.user_id;
     
      let all_blogs = Promise.await(
        Blogs.rawCollection().aggregate([
          fetchQuery("all",searchQuery,user_id,""),
          {
            $lookup: {
              from: 'user',
              localField: 'user_id',
              foreignField: 'user_id',
              as: 'user_data',
            },
          },
          {
            $sort: {
              created_at: -1,
            },
          },  
          {
            $project: {
              'user_data.password': 0,
            },
          },

        ]).toArray(),
      )
      let draft = Promise.await(
        Blogs.rawCollection().aggregate([
          fetchQuery("draft",searchQuery,user_id,""),
          {
            $lookup: {
              from: 'user',
              localField: 'user_id',
              foreignField: 'user_id',
              as: 'user_data',
            },
          },
          {
            $sort: {
              created_at: -1,
            },
          },  
          {
            $project: {
              'user_data.password': 0,
            },
          },

        ]).toArray(),
      )
      let upcoming = Promise.await(
        Blogs.rawCollection().aggregate([
          fetchQuery("coming-soon",searchQuery,user_id,""),
          {
            $lookup: {
              from: 'user',
              localField: 'user_id',
              foreignField: 'user_id',
              as: 'user_data',
            },
          },
          {
            $sort: {
              created_at: -1,
            },
          },  
          {
            $project: {
              'user_data.password': 0,
            },
          },

        ]).toArray(),
      )
          let published = Promise.await(
        Blogs.rawCollection().aggregate([
          fetchQuery("published",searchQuery,user_id,""),
          {
            $lookup: {
              from: 'user',
              localField: 'user_id',
              foreignField: 'user_id',
              as: 'user_data',
            },
          },
          {
            $sort: {
              created_at: -1,
            },
          },  
          {
            $project: {
              'user_data.password': 0,
            },
          },

        ]).toArray(),
      )

          var result={};
          result.all_blogs = all_blogs.length;
          result.draft = draft.length;
          result.upcoming = upcoming.length;
          result.published = published.length;
        return res.status(200).send({ result })
      // }
    }).run()
})


WebApp.connectHandlers.use(app)

Meteor.publish("fetch_all_published_blogs",function(user_id){
   let todayDate =Date.now();
    var checkAllAbusivePosts = AbusivePosts.find(
      // {user_id:user_id, post_type:'blog', status:{$in:[0,1]}}
      {$or:[
                   {
            user_id:user_id,
            post_type:'blog',
            status:{$in:[0,1]}},
                   {
                        post_type: 'blog',
                        status: {
                            $in: [1]
                        }
                   }
               ]
    }
    ).fetch();
    var allAbusivePosts = [];
    for(var i=0;i<checkAllAbusivePosts.length;i++){
      allAbusivePosts.push(checkAllAbusivePosts[i].post_id);
    }
   return   Blogs.find({ 
          $and: [
            { status: true },
            { publish_date: { $lte: todayDate } },
            { user_id: user_id },
            {blog_id:{$nin:allAbusivePosts}}
          ],
        })
})