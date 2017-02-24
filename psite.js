/*! PSITE@TRANSASSIST */

var debug = Number(false);
var id = "psite";
var version = "v1.0.0";
var src_path;
var conf;
var root;
var res_text;
var resizeTimer;
var render_cnt;
window.addEventListener('resize', function (event) {
	if (resizeTimer !== false) {
		clearTimeout(resizeTimer);
	}
	resizeTimer = setTimeout(function () {
		render();
	},Math.floor(1000 / 60 * 10));
});
window.onload=function(){
	if (!document.createElement) return;
	root=document.getElementById(id);
	if(root==null){
		//CreateRootElement
		root=document.createElement("div");
		root.id=id;
		document.body.appendChild(root);
	}
	root.style.overflow="hidden";
	//GetArgument
	var scripts=document.getElementsByTagName("script");
	var src=scripts[scripts.length-1].src;
	src_path=src.substring(0,src.indexOf('?'));
	var query =src.substring(src.indexOf('?')+1);
	var parameters=query.split('&');
	var result={};
	for(var i=0;i<parameters.length;i++){
		var element=parameters[i].split('=');
		result[decodeURIComponent(element[0])]=decodeURIComponent(element[1]);
	}
	conf=result['conf'];
	//ReadPropertiesFile
	var xmlHttp;
	if (window.XMLHttpRequest){
		xmlHttp=new XMLHttpRequest();
	}else{
		if (window.ActiveXObject){
			xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
		}else{
			xmlHttp=null;
		}
	}
	xmlHttp.onreadystatechange=checkStatus;
	xmlHttp.open("GET",conf, true);
	xmlHttp.send(null);
	function checkStatus(){
		if (xmlHttp.readyState==4 && xmlHttp.status==200){
			res_text=xmlHttp.responseText;
			render();
		}else{
			root.innerText="StatusCode:"+xmlHttp.status;
		}
	}
};
function initialize(){
	root.innerText="";
	root.style.cssText="";
	render_cnt=0;
}
function url_dir(){
	return window.location.href.match(".+/")[0];
}
function url_file(){
	var file = window.location.pathname.split("/").pop();
	if(file!="index.html"){
		return file;
	}else{return "";}
}
function escape (string) {
	if(typeof string !== 'string') {
		return string;
	}
	return string.replace(/[&'`"<>]/g, function(match) {
		return {
			//' ': '&nbsp;',
			'&': '&amp;',
			"'": '&#x27;',
			'`': '&#x60;',
			'"': '&quot;',
			'<': '&lt;',
			'>': '&gt;',
		}[match]
	});
}
function fill(target,text){
	return ("__________"+target).substr(-10)+":"+text;
}
function log(text){
	if(debug){
		adddiv(text,"lightgray");
	}else{
		console.log(text)
	}
}
function errorlog(text){
	adddiv(text,"khaki");
}
function adddiv(html,backgroundColor){
	var div=document.createElement('div');
	div.innerHTML=html;
	if(backgroundColor!=null){
		div.style.backgroundColor=backgroundColor;
	}
	div.style.fontFamily="monospace";
	root.appendChild(div);
}


function render() {
	initialize();
	header();
	var hash=window.location.hash.substr(1);
	if(hash!=""){
		//CreateIndex
		index();
	}
	var properties=res_text.split("\n");
	log(fill("AllRender",hash==""));
	log(fill("----------","---------------------------------------------------------------------"));
	for (var line=0;line<properties.length;++line) {
		var property=properties[line];
		if(/^#|^$/.test(property)){
			//Blank or Comment Skip
			log(fill("Comment",property))
		}else{
			var property_regex=/(.*?)=(.*)/;
			if(property_regex.test(property)){
				var parray=property.match(property_regex);
				if(hash==""){
					//AllRender
					pswitch(parray[1],parray[2],false);
				}else{
					if(hash==parray[1]){
						//HashResourceRender
						pswitch(parray[1],parray[2],true);
					}else{
						//NoMatchHashResource
					}
				}
			}else{
				errorlog(fill("Unknown",property))
			}
		}
	}
	footer();
	adddiv("RenderObjectCount:"+render_cnt);
}
function pswitch(key,val,hash_flg){
	if(/^img/.test(key)){
		//Image
		render_cnt++;
		var alink = document.createElement('a');
		//alink.href=url_dir()+url_file()+"#"+key;
		log(fill("img",alink.href));
		var img = document.createElement('img');
		img.setAttribute("alt",key);
		img.setAttribute("src",val);
		img.style.cssText+="display:inline-block;";
		if(hash_flg){
			//ShowSingleFile
			if(hash_flg && /^imgs/.test(key) && (/.+s\..+/.test(val))){
				//SingleRequest&&ExpandUrlPatternWCheck
				//imgs_*=http://***/***s.* -> src override
				var imgs_regex="(.+)/(.+?)s\.([a-z]+([\?#;].*)?$)";
				img.setAttribute("src",val.match(imgs_regex)[1]+"/"+val.match(imgs_regex)[2]+"."+val.match(imgs_regex)[3]);
				img.style.cssText+="width:100%;height:auto;";
			}
			root.style.cssText+="text-align:center;";
		}else{
			//ShowIndex
			img.style.cssText+="cursor:pointer;max-height:128px;";
			img.onclick=function(){
				location.href=url_dir()+url_file()+"#"+key;
				initialize();
				render(res_text);
				//location.reload(true);
			};
		}
		alink.appendChild(img);
		root.appendChild(alink);
	}
}


function index(){
	var index=document.createElement("a");
	index.appendChild(document.createTextNode("Index"));
	index.href=url_file();
	log(fill("index",index.href));
	root.appendChild(index);
	root.appendChild(document.createElement("br"));
}
function header() {
	adddiv('<div id="header" style="font-size:80%;text-align:left;color:gray;">'+new Date().toLocaleString()+',src=<a style="color:gray;text-decoration:none;" href="'+src_path+'">'+src_path+'</a>,conf=<a style="color:gray;text-decoration:none;" href="'+conf+'">'+conf+'</a></div>');
	hr()
}
function footer(){
	hr();
	adddiv('<div id="footer" style="font-size:80%;text-align:right;color:gray;">'+'&copy; Copyright 2015-'+new Date().getFullYear()+' <a href="https://twitter.com/ymst180" style="color:gray!important;">@ymst180</a> '+'Powered by psite '+version+'</a> via <a href="https://github.com/TransAssist" style="color:gray!important;">TransAssist</a>'+'</div>');
}
function hr(){
	var hr =document.createElement('hr');
	hr.style.margin="0";
	root.appendChild(hr);
}
