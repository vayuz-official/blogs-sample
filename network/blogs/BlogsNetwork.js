const axios = require('axios').default;

export class BlogsNetwork{

		async  createBlogs(obj){
			var data = await axios.post(Meteor.absoluteUrl()+'api/v1/createBlogs', obj);
			return data;
		}
		async  updateBlogs(obj){
			var data = await axios.put(Meteor.absoluteUrl()+'api/v1/updateBlogs', obj);
			return data;
		}
		async  deleteBlogs(obj){
			var data = await axios.delete(Meteor.absoluteUrl()+'api/v1/updateBlogs', obj);
			return data;
		}
		async  getBlogs(obj){
			var data = await axios.post(Meteor.absoluteUrl()+'api/v1/blogs/' +  obj);
			return data;
		}

}
