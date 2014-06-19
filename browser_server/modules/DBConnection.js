//Overarching Summary

var MongoClient = require('mongodb').MongoClient,
	Server = require('mongodb').Server,
	mongo = new MongoClient(new Server('localhost', 27017)),
	BSON = require('mongodb').BSONPure;

var database,
	collection = {};


//make a class of Mongo connect

exports.MongoConnect = function(){

	mongo.open(function(err,mongo){
		//connected to database
		console.log('connected to db');
		database = mongo.db('Cameras');
		//setup collection connections

		collection.cameras = database.collection('cameras');
		collection.settings = database.collection('settings');
		collection.options = database.collection('options');
		collection.takes = database.collection('takes')
	})
}

//_doc = mongo document to add
//_type = collection name
//_cb = callback(err,db_document{})

//returns mongo Document inserted
exports.add= function(_type,_doc,_cb){

	collection[_type].insert(_doc,function(e){

		if(!e) _cb(null,_doc);
		else _cb(e);
	})
}

//returns all the results within a collection
//_type = collection name
//_cb = callback(err,collection[])
//returns mongodb Collection as an Array
exports.getAll=function(_type,_cb){

	collection[_type].find().toArray(function(e,_data){

		if(!e) _cb(null,_data);
		else _cb(e);
	})
}

exports.queryCollection=function(_type,_query,_cb){
	queryCollection(_type,_query,_cb);
}

//_type = collection name
//_query = your formatted mongodb query
//_cb = callback(err,collection[])
//returns mongodb Collection as an Array
function queryCollection(_type, _query, _cb){

	collection[_type].find(_query).toArray(function(e,_data){

		if(!e) _cb(null,_data);
		else _cb(e);
	})


}
exports.queryCollectionWithOptions = function(_type,_query,_options,_cb){
	queryCollectionWithOptions(_type, _query, _options, _cb)
}
//_type = collection name
//_query = your formatted mongodb query
//_cb = callback(err,collection[])
//returns mongodb Collection as an Array
function queryCollectionWithOptions(_type, _query, _options, _cb){

	collection[_type].find(_query,_options).toArray(function(e,_data){

		if(!e) _cb(null,_data);
		else _cb(e);
	})


}

//remove a document
//_type = collection name
//_what = collection query
//_cb = callback(e)
exports.remove = function(_type,_what,_cb){

	collection[_type].remove(_what,function(e){
		if(!e) _cb(null)
		else _cb(e)
	})
}

//update a document
//_type = collection name
//_what = collection query
//_updateObj = the update operation which needs to take place
exports.update=function(_type,_what,_updateObj,_cb){

	collection[_type].update(_what,_updateObj,{multi:true},function(e){
		//needs to be tested and finished
		if(!e) _cb(null);
		else _cb(e)
	});
}

//update a document by providing a mongodb ID string
//_type = collection name
//_id = string as mongo id
	//_updateObj = the update operation which needs to take place}
//_cb = callback(err)
exports.updateByID=function(_type,_id,_updateObj,_cb){

	//convert _id to MongoObject
	//var o_id = new BSON.ObjectID(_id.toString());

	collection[_type].update({_id: makeMongoID(_id)},_updateObj,{upsert:true,multi:true},function(e){
		if(!e) _cb(null);
		else _cb(e)
	})
}

//get a mongo document by collection and camera_id string
//_type = collection type
//_slug = single slug
//_cb = callback(err,_document)
exports.getDocumentByCameraID = function(_type,_camera_id,_cb){
	collection[_type].findOne({camera_id:_camera_id},function(e,_doc){
		if(!e)_cb(null,_doc);
		else _cb(e);
	})
}

//get a mongo document by collection and slug string
//_type = collection type
//_slug = single slug
//_cb = callback(err,_document)
exports.getDocumentBySlug = function(_type,_slug,_cb){
	collection[_type].findOne({slug:_slug},function(e,_doc){
		if(!e)_cb(null,_doc);
		else _cb(e);
	})
}
//making global might not be necessary
exports.getDocumentByID= function(_type,__id,_cb){
	getDocumentByID(_type,__id,_cb);
}

//get a mongo document by collection and string id
//_type = collection type
//_id = mongodb id as string
//_cb = callback(err,_document)
function getDocumentByID(_type,__id,_cb){
	collection[_type].findOne({_id:makeMongoID(__id)},function(e,_doc){
		//does error handling happen here?
		if(!e) _cb(null,_doc)
		else _cb(e);
	})

}
//making global
exports.makeMongoID=function(_id){
	return makeMongoID(_id);
}
//create a mongoID Function
function makeMongoID(__id){

	if(typeof __id == "object") return __id;
	if(typeof __id == "string" && __id.length == 24) return new BSON.ObjectID(__id.toString());
	else return '';
}
