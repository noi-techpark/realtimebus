/*
  proj4js.js -- Javascript reprojection library. 
  
  Authors:      Mike Adair madairATdmsolutions.ca
                Richard Greenwood richATgreenwoodmap.com
                Didier Richard didier.richardATign.fr
                Stephen Irons
  License:      LGPL as per: http://www.gnu.org/copyleft/lesser.html 
                Note: This program is an almost direct port of the C library
                Proj4.
*/
Proj4js={defaultDatum:'WGS84',transform:function(source,dest,point){if(!source.readyToUse||!dest.readyToUse){this.reportError("Proj4js initialization for "+source.srsCode+" not yet complete");return point;}
if((source.srsProjNumber=="900913"&&dest.datumCode!="WGS84")||(dest.srsProjNumber=="900913"&&source.datumCode!="WGS84")){var wgs84=Proj4js.WGS84;this.transform(source,wgs84,point);source=wgs84;}
if(source.projName=="longlat"){point.x*=Proj4js.common.D2R;point.y*=Proj4js.common.D2R;}else{if(source.to_meter){point.x*=source.to_meter;point.y*=source.to_meter;}
source.inverse(point);}
if(source.from_greenwich){point.x+=source.from_greenwich;}
point=this.datum_transform(source.datum,dest.datum,point);if(dest.from_greenwich){point.x-=dest.from_greenwich;}
if(dest.projName=="longlat"){point.x*=Proj4js.common.R2D;point.y*=Proj4js.common.R2D;}else{dest.forward(point);if(dest.to_meter){point.x/=dest.to_meter;point.y/=dest.to_meter;}}
return point;},datum_transform:function(source,dest,point){if(source.compare_datums(dest)){return point;}
if(source.datum_type==Proj4js.common.PJD_NODATUM||dest.datum_type==Proj4js.common.PJD_NODATUM){return point;}
if(source.datum_type==Proj4js.common.PJD_GRIDSHIFT)
{alert("ERROR: Grid shift transformations are not implemented yet.");}
if(dest.datum_type==Proj4js.common.PJD_GRIDSHIFT)
{alert("ERROR: Grid shift transformations are not implemented yet.");}
if(source.es!=dest.es||source.a!=dest.a||source.datum_type==Proj4js.common.PJD_3PARAM||source.datum_type==Proj4js.common.PJD_7PARAM||dest.datum_type==Proj4js.common.PJD_3PARAM||dest.datum_type==Proj4js.common.PJD_7PARAM)
{source.geodetic_to_geocentric(point);if(source.datum_type==Proj4js.common.PJD_3PARAM||source.datum_type==Proj4js.common.PJD_7PARAM){source.geocentric_to_wgs84(point);}
if(dest.datum_type==Proj4js.common.PJD_3PARAM||dest.datum_type==Proj4js.common.PJD_7PARAM){dest.geocentric_from_wgs84(point);}
dest.geocentric_to_geodetic(point);}
if(dest.datum_type==Proj4js.common.PJD_GRIDSHIFT)
{alert("ERROR: Grid shift transformations are not implemented yet.");}
return point;},reportError:function(msg){},extend:function(destination,source){destination=destination||{};if(source){for(var property in source){var value=source[property];if(value!==undefined){destination[property]=value;}}}
return destination;},Class:function(){var Class=function(){this.initialize.apply(this,arguments);};var extended={};var parent;for(var i=0;i<arguments.length;++i){if(typeof arguments[i]=="function"){parent=arguments[i].prototype;}else{parent=arguments[i];}
Proj4js.extend(extended,parent);}
Class.prototype=extended;return Class;},bind:function(func,object){var args=Array.prototype.slice.apply(arguments,[2]);return function(){var newArgs=args.concat(Array.prototype.slice.apply(arguments,[0]));return func.apply(object,newArgs);};},scriptName:"proj4js-compressed.js",defsLookupService:'http://spatialreference.org/ref',libPath:null,getScriptLocation:function(){if(this.libPath)return this.libPath;var scriptName=this.scriptName;var scriptNameLen=scriptName.length;var scripts=document.getElementsByTagName('script');for(var i=0;i<scripts.length;i++){var src=scripts[i].getAttribute('src');if(src){var index=src.lastIndexOf(scriptName);if((index>-1)&&(index+scriptNameLen==src.length)){this.libPath=src.slice(0,-scriptNameLen);break;}}}
return this.libPath||"";},loadScript:function(url,onload,onfail,loadCheck){var script=document.createElement('script');script.defer=false;script.type="text/javascript";script.id=url;script.src=url;script.onload=onload;script.onerror=onfail;script.loadCheck=loadCheck;if(/MSIE/.test(navigator.userAgent)){script.onreadystatechange=this.checkReadyState;}
document.getElementsByTagName('head')[0].appendChild(script);},checkReadyState:function(){if(this.readyState=='loaded'){if(!this.loadCheck()){this.onerror();}else{this.onload();}}}};Proj4js.Proj=Proj4js.Class({readyToUse:false,title:null,projName:null,units:null,datum:null,x0:0,y0:0,initialize:function(srsCode){this.srsCodeInput=srsCode;if(srsCode.indexOf('urn:')==0){var urn=srsCode.split(':');if((urn[1]=='ogc'||urn[1]=='x-ogc')&&(urn[2]=='def')&&(urn[3]=='crs')){srsCode=urn[4]+':'+urn[urn.length-1];}}else if(srsCode.indexOf('http://')==0){var url=srsCode.split('#');if(url[0].match(/epsg.org/)){srsCode='EPSG:'+url[1];}else if(url[0].match(/RIG.xml/)){srsCode='IGNF:'+url[1];}}
this.srsCode=srsCode.toUpperCase();if(this.srsCode.indexOf("EPSG")==0){this.srsCode=this.srsCode;this.srsAuth='epsg';this.srsProjNumber=this.srsCode.substring(5);}else if(this.srsCode.indexOf("IGNF")==0){this.srsCode=this.srsCode;this.srsAuth='IGNF';this.srsProjNumber=this.srsCode.substring(5);}else if(this.srsCode.indexOf("CRS")==0){this.srsCode=this.srsCode;this.srsAuth='CRS';this.srsProjNumber=this.srsCode.substring(4);}else{this.srsAuth='';this.srsProjNumber=this.srsCode;}
this.loadProjDefinition();},loadProjDefinition:function(){if(Proj4js.defs[this.srsCode]){this.defsLoaded();return;}
var url=Proj4js.getScriptLocation()+'defs/'+this.srsAuth.toUpperCase()+this.srsProjNumber+'.js';Proj4js.loadScript(url,Proj4js.bind(this.defsLoaded,this),Proj4js.bind(this.loadFromService,this),Proj4js.bind(this.checkDefsLoaded,this));},loadFromService:function(){var url=Proj4js.defsLookupService+'/'+this.srsAuth+'/'+this.srsProjNumber+'/proj4js/';Proj4js.loadScript(url,Proj4js.bind(this.defsLoaded,this),Proj4js.bind(this.defsFailed,this),Proj4js.bind(this.checkDefsLoaded,this));},defsLoaded:function(){this.parseDefs();this.loadProjCode(this.projName);},checkDefsLoaded:function(){if(Proj4js.defs[this.srsCode]){return true;}else{return false;}},defsFailed:function(){Proj4js.reportError('failed to load projection definition for: '+this.srsCode);Proj4js.defs[this.srsCode]=Proj4js.defs['WGS84'];this.defsLoaded();},loadProjCode:function(projName){if(Proj4js.Proj[projName]){this.initTransforms();return;}
var url=Proj4js.getScriptLocation()+'projCode/'+projName+'.js';Proj4js.loadScript(url,Proj4js.bind(this.loadProjCodeSuccess,this,projName),Proj4js.bind(this.loadProjCodeFailure,this,projName),Proj4js.bind(this.checkCodeLoaded,this,projName));},loadProjCodeSuccess:function(projName){if(Proj4js.Proj[projName].dependsOn){this.loadProjCode(Proj4js.Proj[projName].dependsOn);}else{this.initTransforms();}},loadProjCodeFailure:function(projName){Proj4js.reportError("failed to find projection file for: "+projName);},checkCodeLoaded:function(projName){if(Proj4js.Proj[projName]){return true;}else{return false;}},initTransforms:function(){Proj4js.extend(this,Proj4js.Proj[this.projName]);this.init();this.readyToUse=true;},parseDefs:function(){this.defData=Proj4js.defs[this.srsCode];var paramName,paramVal;if(!this.defData){return;}
var paramArray=this.defData.split("+");for(var prop=0;prop<paramArray.length;prop++){var property=paramArray[prop].split("=");paramName=property[0].toLowerCase();paramVal=property[1];switch(paramName.replace(/\s/gi,"")){case"":break;case"title":this.title=paramVal;break;case"proj":this.projName=paramVal.replace(/\s/gi,"");break;case"units":this.units=paramVal.replace(/\s/gi,"");break;case"datum":this.datumCode=paramVal.replace(/\s/gi,"");break;case"nadgrids":this.nagrids=paramVal.replace(/\s/gi,"");break;case"ellps":this.ellps=paramVal.replace(/\s/gi,"");break;case"a":this.a=parseFloat(paramVal);break;case"b":this.b=parseFloat(paramVal);break;case"rf":this.rf=parseFloat(paramVal);break;case"lat_0":this.lat0=paramVal*Proj4js.common.D2R;break;case"lat_1":this.lat1=paramVal*Proj4js.common.D2R;break;case"lat_2":this.lat2=paramVal*Proj4js.common.D2R;break;case"lat_ts":this.lat_ts=paramVal*Proj4js.common.D2R;break;case"lon_0":this.long0=paramVal*Proj4js.common.D2R;break;case"alpha":this.alpha=parseFloat(paramVal)*Proj4js.common.D2R;break;case"lonc":this.longc=paramVal*Proj4js.common.D2R;break;case"x_0":this.x0=parseFloat(paramVal);break;case"y_0":this.y0=parseFloat(paramVal);break;case"k_0":this.k0=parseFloat(paramVal);break;case"k":this.k0=parseFloat(paramVal);break;case"r_a":this.R_A=true;break;case"zone":this.zone=parseInt(paramVal);break;case"south":this.utmSouth=true;break;case"towgs84":this.datum_params=paramVal.split(",");break;case"to_meter":this.to_meter=parseFloat(paramVal);break;case"from_greenwich":this.from_greenwich=paramVal*Proj4js.common.D2R;break;case"pm":paramVal=paramVal.replace(/\s/gi,"");this.from_greenwich=Proj4js.PrimeMeridian[paramVal]?Proj4js.PrimeMeridian[paramVal]:parseFloat(paramVal);this.from_greenwich*=Proj4js.common.D2R;break;case"no_defs":break;default:}}
this.deriveConstants();},deriveConstants:function(){if(this.nagrids=='@null')this.datumCode='none';if(this.datumCode&&this.datumCode!='none'){var datumDef=Proj4js.Datum[this.datumCode];if(datumDef){this.datum_params=datumDef.towgs84?datumDef.towgs84.split(','):null;this.ellps=datumDef.ellipse;this.datumName=datumDef.datumName?datumDef.datumName:this.datumCode;}}
if(!this.a){var ellipse=Proj4js.Ellipsoid[this.ellps]?Proj4js.Ellipsoid[this.ellps]:Proj4js.Ellipsoid['WGS84'];Proj4js.extend(this,ellipse);}
if(this.rf&&!this.b)this.b=(1.0-1.0/this.rf)*this.a;if(Math.abs(this.a-this.b)<Proj4js.common.EPSLN){this.sphere=true;this.b=this.a;}
this.a2=this.a*this.a;this.b2=this.b*this.b;this.es=(this.a2-this.b2)/this.a2;this.e=Math.sqrt(this.es);if(this.R_A){this.a*=1.-this.es*(Proj4js.common.SIXTH+this.es*(Proj4js.common.RA4+this.es*Proj4js.common.RA6));this.a2=this.a*this.a;this.b2=this.b*this.b;this.es=0.;}
this.ep2=(this.a2-this.b2)/this.b2;if(!this.k0)this.k0=1.0;this.datum=new Proj4js.datum(this);}});Proj4js.Proj.longlat={init:function(){},forward:function(pt){return pt;},inverse:function(pt){return pt;}};Proj4js.defs={'WGS84':"+title=long/lat:WGS84 +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees",'EPSG:4326':"+title=long/lat:WGS84 +proj=longlat +a=6378137.0 +b=6356752.31424518 +ellps=WGS84 +datum=WGS84 +units=degrees",'EPSG:4269':"+title=long/lat:NAD83 +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees",'EPSG:3785':"+title= Google Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"};Proj4js.defs['GOOGLE']=Proj4js.defs['EPSG:3785'];Proj4js.defs['EPSG:900913']=Proj4js.defs['EPSG:3785'];Proj4js.defs['EPSG:102113']=Proj4js.defs['EPSG:3785'];Proj4js.common={PI:3.141592653589793238,HALF_PI:1.570796326794896619,TWO_PI:6.283185307179586477,FORTPI:0.78539816339744833,R2D:57.29577951308232088,D2R:0.01745329251994329577,SEC_TO_RAD:4.84813681109535993589914102357e-6,EPSLN:1.0e-10,MAX_ITER:20,COS_67P5:0.38268343236508977,AD_C:1.0026000,PJD_UNKNOWN:0,PJD_3PARAM:1,PJD_7PARAM:2,PJD_GRIDSHIFT:3,PJD_WGS84:4,PJD_NODATUM:5,SRS_WGS84_SEMIMAJOR:6378137.0,SIXTH:.1666666666666666667,RA4:.04722222222222222222,RA6:.02215608465608465608,RV4:.06944444444444444444,RV6:.04243827160493827160,msfnz:function(eccent,sinphi,cosphi){var con=eccent*sinphi;return cosphi/(Math.sqrt(1.0-con*con));},tsfnz:function(eccent,phi,sinphi){var con=eccent*sinphi;var com=.5*eccent;con=Math.pow(((1.0-con)/(1.0+con)),com);return(Math.tan(.5*(this.HALF_PI-phi))/con);},phi2z:function(eccent,ts){var eccnth=.5*eccent;var con,dphi;var phi=this.HALF_PI-2*Math.atan(ts);for(i=0;i<=15;i++){con=eccent*Math.sin(phi);dphi=this.HALF_PI-2*Math.atan(ts*(Math.pow(((1.0-con)/(1.0+con)),eccnth)))-phi;phi+=dphi;if(Math.abs(dphi)<=.0000000001)return phi;}
alert("phi2z has NoConvergence");return(-9999);},qsfnz:function(eccent,sinphi){var con;if(eccent>1.0e-7){con=eccent*sinphi;return((1.0-eccent*eccent)*(sinphi/(1.0-con*con)-(.5/eccent)*Math.log((1.0-con)/(1.0+con))));}else{return(2.0*sinphi);}},asinz:function(x){if(Math.abs(x)>1.0){x=(x>1.0)?1.0:-1.0;}
return Math.asin(x);},e0fn:function(x){return(1.0-0.25*x*(1.0+x/16.0*(3.0+1.25*x)));},e1fn:function(x){return(0.375*x*(1.0+0.25*x*(1.0+0.46875*x)));},e2fn:function(x){return(0.05859375*x*x*(1.0+0.75*x));},e3fn:function(x){return(x*x*x*(35.0/3072.0));},mlfn:function(e0,e1,e2,e3,phi){return(e0*phi-e1*Math.sin(2.0*phi)+e2*Math.sin(4.0*phi)-e3*Math.sin(6.0*phi));},srat:function(esinp,exp){return(Math.pow((1.0-esinp)/(1.0+esinp),exp));},sign:function(x){if(x<0.0)return(-1);else return(1);},adjust_lon:function(x){x=(Math.abs(x)<this.PI)?x:(x-(this.sign(x)*this.TWO_PI));return x;},adjust_lat:function(x){x=(Math.abs(x)<this.HALF_PI)?x:(x-(this.sign(x)*this.PI));return x;},latiso:function(eccent,phi,sinphi){if(Math.abs(phi)>this.HALF_PI)return+Number.NaN;if(phi==this.HALF_PI)return Number.POSITIVE_INFINITY;if(phi==-1.0*this.HALF_PI)return-1.0*Number.POSITIVE_INFINITY;var con=eccent*sinphi;return Math.log(Math.tan((this.HALF_PI+phi)/2.0))+eccent*Math.log((1.0-con)/(1.0+con))/2.0;},fL:function(x,L){return 2.0*Math.atan(x*Math.exp(L))-this.HALF_PI;},invlatiso:function(eccent,ts){var phi=this.fL(1.0,ts);var Iphi=0.0;var con=0.0;do{Iphi=phi;con=eccent*Math.sin(Iphi);phi=this.fL(Math.exp(eccent*Math.log((1.0+con)/(1.0-con))/2.0),ts)}while(Math.abs(phi-Iphi)>1.0e-12);return phi;},sinh:function(x)
{var r=Math.exp(x);r=(r-1.0/r)/2.0;return r;},cosh:function(x)
{var r=Math.exp(x);r=(r+1.0/r)/2.0;return r;},tanh:function(x)
{var r=Math.exp(x);r=(r-1.0/r)/(r+1.0/r);return r;},asinh:function(x)
{var s=(x>=0?1.0:-1.0);return s*(Math.log(Math.abs(x)+Math.sqrt(x*x+1.0)));},acosh:function(x)
{return 2.0*Math.log(Math.sqrt((x+1.0)/2.0)+Math.sqrt((x-1.0)/2.0));},atanh:function(x)
{return Math.log((x-1.0)/(x+1.0))/2.0;},gN:function(a,e,sinphi)
{var temp=e*sinphi;return a/Math.sqrt(1.0-temp*temp);}};Proj4js.datum=Proj4js.Class({initialize:function(proj){this.datum_type=Proj4js.common.PJD_WGS84;if(proj.datumCode&&proj.datumCode=='none'){this.datum_type=Proj4js.common.PJD_NODATUM;}
if(proj&&proj.datum_params){for(var i=0;i<proj.datum_params.length;i++){proj.datum_params[i]=parseFloat(proj.datum_params[i]);}
if(proj.datum_params[0]!=0||proj.datum_params[1]!=0||proj.datum_params[2]!=0){this.datum_type=Proj4js.common.PJD_3PARAM;}
if(proj.datum_params.length>3){if(proj.datum_params[3]!=0||proj.datum_params[4]!=0||proj.datum_params[5]!=0||proj.datum_params[6]!=0){this.datum_type=Proj4js.common.PJD_7PARAM;proj.datum_params[3]*=Proj4js.common.SEC_TO_RAD;proj.datum_params[4]*=Proj4js.common.SEC_TO_RAD;proj.datum_params[5]*=Proj4js.common.SEC_TO_RAD;proj.datum_params[6]=(proj.datum_params[6]/1000000.0)+1.0;}}}
if(proj){this.a=proj.a;this.b=proj.b;this.es=proj.es;this.ep2=proj.ep2;this.datum_params=proj.datum_params;}},compare_datums:function(dest){if(this.datum_type!=dest.datum_type){return false;}else if(this.a!=dest.a||Math.abs(this.es-dest.es)>0.000000000050){return false;}else if(this.datum_type==Proj4js.common.PJD_3PARAM){return(this.datum_params[0]==dest.datum_params[0]&&this.datum_params[1]==dest.datum_params[1]&&this.datum_params[2]==dest.datum_params[2]);}else if(this.datum_type==Proj4js.common.PJD_7PARAM){return(this.datum_params[0]==dest.datum_params[0]&&this.datum_params[1]==dest.datum_params[1]&&this.datum_params[2]==dest.datum_params[2]&&this.datum_params[3]==dest.datum_params[3]&&this.datum_params[4]==dest.datum_params[4]&&this.datum_params[5]==dest.datum_params[5]&&this.datum_params[6]==dest.datum_params[6]);}else if(this.datum_type==Proj4js.common.PJD_GRIDSHIFT){return strcmp(pj_param(this.params,"snadgrids").s,pj_param(dest.params,"snadgrids").s)==0;}else{return true;}},geodetic_to_geocentric:function(p){var Longitude=p.x;var Latitude=p.y;var Height=p.z?p.z:0;var X;var Y;var Z;var Error_Code=0;var Rn;var Sin_Lat;var Sin2_Lat;var Cos_Lat;if(Latitude<-Proj4js.common.HALF_PI&&Latitude>-1.001*Proj4js.common.HALF_PI){Latitude=-Proj4js.common.HALF_PI;}else if(Latitude>Proj4js.common.HALF_PI&&Latitude<1.001*Proj4js.common.HALF_PI){Latitude=Proj4js.common.HALF_PI;}else if((Latitude<-Proj4js.common.HALF_PI)||(Latitude>Proj4js.common.HALF_PI)){Proj4js.reportError('geocent:lat out of range:'+Latitude);return null;}
if(Longitude>Proj4js.common.PI)Longitude-=(2*Proj4js.common.PI);Sin_Lat=Math.sin(Latitude);Cos_Lat=Math.cos(Latitude);Sin2_Lat=Sin_Lat*Sin_Lat;Rn=this.a/(Math.sqrt(1.0e0-this.es*Sin2_Lat));X=(Rn+Height)*Cos_Lat*Math.cos(Longitude);Y=(Rn+Height)*Cos_Lat*Math.sin(Longitude);Z=((Rn*(1-this.es))+Height)*Sin_Lat;p.x=X;p.y=Y;p.z=Z;return Error_Code;},geocentric_to_geodetic:function(p){var genau=1.E-12;var genau2=(genau*genau);var maxiter=30;var P;var RR;var CT;var ST;var RX;var RK;var RN;var CPHI0;var SPHI0;var CPHI;var SPHI;var SDPHI;var At_Pole;var iter;var X=p.x;var Y=p.y;var Z=p.z?p.z:0.0;var Longitude;var Latitude;var Height;At_Pole=false;P=Math.sqrt(X*X+Y*Y);RR=Math.sqrt(X*X+Y*Y+Z*Z);if(P/this.a<genau){At_Pole=true;Longitude=0.0;if(RR/this.a<genau){Latitude=Proj4js.common.HALF_PI;Height=-this.b;return;}}else{Longitude=Math.atan2(Y,X);}
CT=Z/RR;ST=P/RR;RX=1.0/Math.sqrt(1.0-this.es*(2.0-this.es)*ST*ST);CPHI0=ST*(1.0-this.es)*RX;SPHI0=CT*RX;iter=0;do
{iter++;RN=this.a/Math.sqrt(1.0-this.es*SPHI0*SPHI0);Height=P*CPHI0+Z*SPHI0-RN*(1.0-this.es*SPHI0*SPHI0);RK=this.es*RN/(RN+Height);RX=1.0/Math.sqrt(1.0-RK*(2.0-RK)*ST*ST);CPHI=ST*(1.0-RK)*RX;SPHI=CT*RX;SDPHI=SPHI*CPHI0-CPHI*SPHI0;CPHI0=CPHI;SPHI0=SPHI;}
while(SDPHI*SDPHI>genau2&&iter<maxiter);Latitude=Math.atan(SPHI/Math.abs(CPHI));p.x=Longitude;p.y=Latitude;p.z=Height;return p;},geocentric_to_geodetic_noniter:function(p){var X=p.x;var Y=p.y;var Z=p.z?p.z:0;var Longitude;var Latitude;var Height;var W;var W2;var T0;var T1;var S0;var S1;var Sin_B0;var Sin3_B0;var Cos_B0;var Sin_p1;var Cos_p1;var Rn;var Sum;var At_Pole;X=parseFloat(X);Y=parseFloat(Y);Z=parseFloat(Z);At_Pole=false;if(X!=0.0)
{Longitude=Math.atan2(Y,X);}
else
{if(Y>0)
{Longitude=Proj4js.common.HALF_PI;}
else if(Y<0)
{Longitude=-Proj4js.common.HALF_PI;}
else
{At_Pole=true;Longitude=0.0;if(Z>0.0)
{Latitude=Proj4js.common.HALF_PI;}
else if(Z<0.0)
{Latitude=-Proj4js.common.HALF_PI;}
else
{Latitude=Proj4js.common.HALF_PI;Height=-this.b;return;}}}
W2=X*X+Y*Y;W=Math.sqrt(W2);T0=Z*Proj4js.common.AD_C;S0=Math.sqrt(T0*T0+W2);Sin_B0=T0/S0;Cos_B0=W/S0;Sin3_B0=Sin_B0*Sin_B0*Sin_B0;T1=Z+this.b*this.ep2*Sin3_B0;Sum=W-this.a*this.es*Cos_B0*Cos_B0*Cos_B0;S1=Math.sqrt(T1*T1+Sum*Sum);Sin_p1=T1/S1;Cos_p1=Sum/S1;Rn=this.a/Math.sqrt(1.0-this.es*Sin_p1*Sin_p1);if(Cos_p1>=Proj4js.common.COS_67P5)
{Height=W/Cos_p1-Rn;}
else if(Cos_p1<=-Proj4js.common.COS_67P5)
{Height=W/-Cos_p1-Rn;}
else
{Height=Z/Sin_p1+Rn*(this.es-1.0);}
if(At_Pole==false)
{Latitude=Math.atan(Sin_p1/Cos_p1);}
p.x=Longitude;p.y=Latitude;p.z=Height;return p;},geocentric_to_wgs84:function(p){if(this.datum_type==Proj4js.common.PJD_3PARAM)
{p.x+=this.datum_params[0];p.y+=this.datum_params[1];p.z+=this.datum_params[2];}
else if(this.datum_type==Proj4js.common.PJD_7PARAM)
{var Dx_BF=this.datum_params[0];var Dy_BF=this.datum_params[1];var Dz_BF=this.datum_params[2];var Rx_BF=this.datum_params[3];var Ry_BF=this.datum_params[4];var Rz_BF=this.datum_params[5];var M_BF=this.datum_params[6];var x_out=M_BF*(p.x-Rz_BF*p.y+Ry_BF*p.z)+Dx_BF;var y_out=M_BF*(Rz_BF*p.x+p.y-Rx_BF*p.z)+Dy_BF;var z_out=M_BF*(-Ry_BF*p.x+Rx_BF*p.y+p.z)+Dz_BF;p.x=x_out;p.y=y_out;p.z=z_out;}},geocentric_from_wgs84:function(p){if(this.datum_type==Proj4js.common.PJD_3PARAM)
{p.x-=this.datum_params[0];p.y-=this.datum_params[1];p.z-=this.datum_params[2];}
else if(this.datum_type==Proj4js.common.PJD_7PARAM)
{var Dx_BF=this.datum_params[0];var Dy_BF=this.datum_params[1];var Dz_BF=this.datum_params[2];var Rx_BF=this.datum_params[3];var Ry_BF=this.datum_params[4];var Rz_BF=this.datum_params[5];var M_BF=this.datum_params[6];var x_tmp=(p.x-Dx_BF)/M_BF;var y_tmp=(p.y-Dy_BF)/M_BF;var z_tmp=(p.z-Dz_BF)/M_BF;p.x=x_tmp+Rz_BF*y_tmp-Ry_BF*z_tmp;p.y=-Rz_BF*x_tmp+y_tmp+Rx_BF*z_tmp;p.z=Ry_BF*x_tmp-Rx_BF*y_tmp+z_tmp;}}});Proj4js.Point=Proj4js.Class({initialize:function(x,y,z){if(typeof x=='object'){this.x=x[0];this.y=x[1];this.z=x[2]||0.0;}else if(typeof x=='string'){var coords=x.split(',');this.x=parseFloat(coords[0]);this.y=parseFloat(coords[1]);this.z=parseFloat(coords[2])||0.0;}else{this.x=x;this.y=y;this.z=z||0.0;}},clone:function(){return new Proj4js.Point(this.x,this.y,this.z);},toString:function(){return("x="+this.x+",y="+this.y);},toShortString:function(){return(this.x+", "+this.y);}});Proj4js.PrimeMeridian={"greenwich":0.0,"lisbon":-9.131906111111,"paris":2.337229166667,"bogota":-74.080916666667,"madrid":-3.687938888889,"rome":12.452333333333,"bern":7.439583333333,"jakarta":106.807719444444,"ferro":-17.666666666667,"brussels":4.367975,"stockholm":18.058277777778,"athens":23.7163375,"oslo":10.722916666667};Proj4js.Ellipsoid={"MERIT":{a:6378137.0,rf:298.257,ellipseName:"MERIT 1983"},"SGS85":{a:6378136.0,rf:298.257,ellipseName:"Soviet Geodetic System 85"},"GRS80":{a:6378137.0,rf:298.257222101,ellipseName:"GRS 1980(IUGG, 1980)"},"IAU76":{a:6378140.0,rf:298.257,ellipseName:"IAU 1976"},"airy":{a:6377563.396,b:6356256.910,ellipseName:"Airy 1830"},"APL4.":{a:6378137,rf:298.25,ellipseName:"Appl. Physics. 1965"},"NWL9D":{a:6378145.0,rf:298.25,ellipseName:"Naval Weapons Lab., 1965"},"mod_airy":{a:6377340.189,b:6356034.446,ellipseName:"Modified Airy"},"andrae":{a:6377104.43,rf:300.0,ellipseName:"Andrae 1876 (Den., Iclnd.)"},"aust_SA":{a:6378160.0,rf:298.25,ellipseName:"Australian Natl & S. Amer. 1969"},"GRS67":{a:6378160.0,rf:298.2471674270,ellipseName:"GRS 67(IUGG 1967)"},"bessel":{a:6377397.155,rf:299.1528128,ellipseName:"Bessel 1841"},"bess_nam":{a:6377483.865,rf:299.1528128,ellipseName:"Bessel 1841 (Namibia)"},"clrk66":{a:6378206.4,b:6356583.8,ellipseName:"Clarke 1866"},"clrk80":{a:6378249.145,rf:293.4663,ellipseName:"Clarke 1880 mod."},"CPM":{a:6375738.7,rf:334.29,ellipseName:"Comm. des Poids et Mesures 1799"},"delmbr":{a:6376428.0,rf:311.5,ellipseName:"Delambre 1810 (Belgium)"},"engelis":{a:6378136.05,rf:298.2566,ellipseName:"Engelis 1985"},"evrst30":{a:6377276.345,rf:300.8017,ellipseName:"Everest 1830"},"evrst48":{a:6377304.063,rf:300.8017,ellipseName:"Everest 1948"},"evrst56":{a:6377301.243,rf:300.8017,ellipseName:"Everest 1956"},"evrst69":{a:6377295.664,rf:300.8017,ellipseName:"Everest 1969"},"evrstSS":{a:6377298.556,rf:300.8017,ellipseName:"Everest (Sabah & Sarawak)"},"fschr60":{a:6378166.0,rf:298.3,ellipseName:"Fischer (Mercury Datum) 1960"},"fschr60m":{a:6378155.0,rf:298.3,ellipseName:"Fischer 1960"},"fschr68":{a:6378150.0,rf:298.3,ellipseName:"Fischer 1968"},"helmert":{a:6378200.0,rf:298.3,ellipseName:"Helmert 1906"},"hough":{a:6378270.0,rf:297.0,ellipseName:"Hough"},"intl":{a:6378388.0,rf:297.0,ellipseName:"International 1909 (Hayford)"},"kaula":{a:6378163.0,rf:298.24,ellipseName:"Kaula 1961"},"lerch":{a:6378139.0,rf:298.257,ellipseName:"Lerch 1979"},"mprts":{a:6397300.0,rf:191.0,ellipseName:"Maupertius 1738"},"new_intl":{a:6378157.5,b:6356772.2,ellipseName:"New International 1967"},"plessis":{a:6376523.0,rf:6355863.0,ellipseName:"Plessis 1817 (France)"},"krass":{a:6378245.0,rf:298.3,ellipseName:"Krassovsky, 1942"},"SEasia":{a:6378155.0,b:6356773.3205,ellipseName:"Southeast Asia"},"walbeck":{a:6376896.0,b:6355834.8467,ellipseName:"Walbeck"},"WGS60":{a:6378165.0,rf:298.3,ellipseName:"WGS 60"},"WGS66":{a:6378145.0,rf:298.25,ellipseName:"WGS 66"},"WGS72":{a:6378135.0,rf:298.26,ellipseName:"WGS 72"},"WGS84":{a:6378137.0,rf:298.257223563,ellipseName:"WGS 84"},"sphere":{a:6370997.0,b:6370997.0,ellipseName:"Normal Sphere (r=6370997)"}};Proj4js.Datum={"WGS84":{towgs84:"0,0,0",ellipse:"WGS84",datumName:"WGS84"},"GGRS87":{towgs84:"-199.87,74.79,246.62",ellipse:"GRS80",datumName:"Greek_Geodetic_Reference_System_1987"},"NAD83":{towgs84:"0,0,0",ellipse:"GRS80",datumName:"North_American_Datum_1983"},"NAD27":{nadgrids:"@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat",ellipse:"clrk66",datumName:"North_American_Datum_1927"},"potsdam":{towgs84:"606.0,23.0,413.0",ellipse:"bessel",datumName:"Potsdam Rauenberg 1950 DHDN"},"carthage":{towgs84:"-263.0,6.0,431.0",ellipse:"clark80",datumName:"Carthage 1934 Tunisia"},"hermannskogel":{towgs84:"653.0,-212.0,449.0",ellipse:"bessel",datumName:"Hermannskogel"},"ire65":{towgs84:"482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",ellipse:"mod_airy",datumName:"Ireland 1965"},"nzgd49":{towgs84:"59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993",ellipse:"intl",datumName:"New Zealand Geodetic Datum 1949"},"OSGB36":{towgs84:"446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894",ellipse:"airy",datumName:"Airy 1830"}};Proj4js.WGS84=new Proj4js.Proj('WGS84');Proj4js.Datum['OSB36']=Proj4js.Datum['OSGB36'];Proj4js.Proj.aea={init:function(){if(Math.abs(this.lat1+this.lat2)<Proj4js.common.EPSLN){Proj4js.reportError("aeaInitEqualLatitudes");return;}
this.temp=this.b/this.a;this.es=1.0-Math.pow(this.temp,2);this.e3=Math.sqrt(this.es);this.sin_po=Math.sin(this.lat1);this.cos_po=Math.cos(this.lat1);this.t1=this.sin_po;this.con=this.sin_po;this.ms1=Proj4js.common.msfnz(this.e3,this.sin_po,this.cos_po);this.qs1=Proj4js.common.qsfnz(this.e3,this.sin_po,this.cos_po);this.sin_po=Math.sin(this.lat2);this.cos_po=Math.cos(this.lat2);this.t2=this.sin_po;this.ms2=Proj4js.common.msfnz(this.e3,this.sin_po,this.cos_po);this.qs2=Proj4js.common.qsfnz(this.e3,this.sin_po,this.cos_po);this.sin_po=Math.sin(this.lat0);this.cos_po=Math.cos(this.lat0);this.t3=this.sin_po;this.qs0=Proj4js.common.qsfnz(this.e3,this.sin_po,this.cos_po);if(Math.abs(this.lat1-this.lat2)>Proj4js.common.EPSLN){this.ns0=(this.ms1*this.ms1-this.ms2*this.ms2)/(this.qs2-this.qs1);}else{this.ns0=this.con;}
this.c=this.ms1*this.ms1+this.ns0*this.qs1;this.rh=this.a*Math.sqrt(this.c-this.ns0*this.qs0)/this.ns0;},forward:function(p){var lon=p.x;var lat=p.y;this.sin_phi=Math.sin(lat);this.cos_phi=Math.cos(lat);var qs=Proj4js.common.qsfnz(this.e3,this.sin_phi,this.cos_phi);var rh1=this.a*Math.sqrt(this.c-this.ns0*qs)/this.ns0;var theta=this.ns0*Proj4js.common.adjust_lon(lon-this.long0);var x=rh1*Math.sin(theta)+this.x0;var y=this.rh-rh1*Math.cos(theta)+this.y0;p.x=x;p.y=y;return p;},inverse:function(p){var rh1,qs,con,theta,lon,lat;p.x-=this.x0;p.y=this.rh-p.y+this.y0;if(this.ns0>=0){rh1=Math.sqrt(p.x*p.x+p.y*p.y);con=1.0;}else{rh1=-Math.sqrt(p.x*p.x+p.y*p.y);con=-1.0;}
theta=0.0;if(rh1!=0.0){theta=Math.atan2(con*p.x,con*p.y);}
con=rh1*this.ns0/this.a;qs=(this.c-con*con)/this.ns0;if(this.e3>=1e-10){con=1-.5*(1.0-this.es)*Math.log((1.0-this.e3)/(1.0+this.e3))/this.e3;if(Math.abs(Math.abs(con)-Math.abs(qs))>.0000000001){lat=this.phi1z(this.e3,qs);}else{if(qs>=0){lat=.5*PI;}else{lat=-.5*PI;}}}else{lat=this.phi1z(e3,qs);}
lon=Proj4js.common.adjust_lon(theta/this.ns0+this.long0);p.x=lon;p.y=lat;return p;},phi1z:function(eccent,qs){var con,com,dphi;var phi=Proj4js.common.asinz(.5*qs);if(eccent<Proj4js.common.EPSLN)return phi;var eccnts=eccent*eccent;for(var i=1;i<=25;i++){sinphi=Math.sin(phi);cosphi=Math.cos(phi);con=eccent*sinphi;com=1.0-con*con;dphi=.5*com*com/cosphi*(qs/(1.0-eccnts)-sinphi/com+.5/eccent*Math.log((1.0-con)/(1.0+con)));phi=phi+dphi;if(Math.abs(dphi)<=1e-7)return phi;}
Proj4js.reportError("aea:phi1z:Convergence error");return null;}};Proj4js.Proj.sterea={dependsOn:'gauss',init:function(){Proj4js.Proj['gauss'].init.apply(this);if(!this.rc){Proj4js.reportError("sterea:init:E_ERROR_0");return;}
this.sinc0=Math.sin(this.phic0);this.cosc0=Math.cos(this.phic0);this.R2=2.0*this.rc;if(!this.title)this.title="Oblique Stereographic Alternative";},forward:function(p){p.x=Proj4js.common.adjust_lon(p.x-this.long0);Proj4js.Proj['gauss'].forward.apply(this,[p]);sinc=Math.sin(p.y);cosc=Math.cos(p.y);cosl=Math.cos(p.x);k=this.k0*this.R2/(1.0+this.sinc0*sinc+this.cosc0*cosc*cosl);p.x=k*cosc*Math.sin(p.x);p.y=k*(this.cosc0*sinc-this.sinc0*cosc*cosl);p.x=this.a*p.x+this.x0;p.y=this.a*p.y+this.y0;return p;},inverse:function(p){var lon,lat;p.x=(p.x-this.x0)/this.a;p.y=(p.y-this.y0)/this.a;p.x/=this.k0;p.y/=this.k0;if((rho=Math.sqrt(p.x*p.x+p.y*p.y))){c=2.0*Math.atan2(rho,this.R2);sinc=Math.sin(c);cosc=Math.cos(c);lat=Math.asin(cosc*this.sinc0+p.y*sinc*this.cosc0/rho);lon=Math.atan2(p.x*sinc,rho*this.cosc0*cosc-p.y*this.sinc0*sinc);}else{lat=this.phic0;lon=0.;}
p.x=lon;p.y=lat;Proj4js.Proj['gauss'].inverse.apply(this,[p]);p.x=Proj4js.common.adjust_lon(p.x+this.long0);return p;}};function phi4z(eccent,e0,e1,e2,e3,a,b,c,phi){var sinphi,sin2ph,tanph,ml,mlp,con1,con2,con3,dphi,i;phi=a;for(i=1;i<=15;i++){sinphi=Math.sin(phi);tanphi=Math.tan(phi);c=tanphi*Math.sqrt(1.0-eccent*sinphi*sinphi);sin2ph=Math.sin(2.0*phi);ml=e0*phi-e1*sin2ph+e2*Math.sin(4.0*phi)-e3*Math.sin(6.0*phi);mlp=e0-2.0*e1*Math.cos(2.0*phi)+4.0*e2*Math.cos(4.0*phi)-6.0*e3*Math.cos(6.0*phi);con1=2.0*ml+c*(ml*ml+b)-2.0*a*(c*ml+1.0);con2=eccent*sin2ph*(ml*ml+b-2.0*a*ml)/(2.0*c);con3=2.0*(a-ml)*(c*mlp-2.0/sin2ph)-2.0*mlp;dphi=con1/(con2+con3);phi+=dphi;if(Math.abs(dphi)<=.0000000001)return(phi);}
Proj4js.reportError("phi4z: No convergence");return null;}
function e4fn(x){var con,com;con=1.0+x;com=1.0-x;return(Math.sqrt((Math.pow(con,con))*(Math.pow(com,com))));}
Proj4js.Proj.poly={init:function(){var temp;if(this.lat0=0)this.lat0=90;this.temp=this.b/this.a;this.es=1.0-Math.pow(this.temp,2);this.e=Math.sqrt(this.es);this.e0=Proj4js.common.e0fn(this.es);this.e1=Proj4js.common.e1fn(this.es);this.e2=Proj4js.common.e2fn(this.es);this.e3=Proj4js.common.e3fn(this.es);this.ml0=Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat0);},forward:function(p){var sinphi,cosphi;var al;var c;var con,ml;var ms;var x,y;var lon=p.x;var lat=p.y;con=Proj4js.common.adjust_lon(lon-this.long0);if(Math.abs(lat)<=.0000001){x=this.x0+this.a*con;y=this.y0-this.a*this.ml0;}else{sinphi=Math.sin(lat);cosphi=Math.cos(lat);ml=Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,lat);ms=Proj4js.common.msfnz(this.e,sinphi,cosphi);con=sinphi;x=this.x0+this.a*ms*Math.sin(con)/sinphi;y=this.y0+this.a*(ml-this.ml0+ms*(1.0-Math.cos(con))/sinphi);}
p.x=x;p.y=y;return p;},inverse:function(p){var sin_phi,cos_phi;var al;var b;var c;var con,ml;var iflg;var lon,lat;p.x-=this.x0;p.y-=this.y0;al=this.ml0+p.y/this.a;iflg=0;if(Math.abs(al)<=.0000001){lon=p.x/this.a+this.long0;lat=0.0;}else{b=al*al+(p.x/this.a)*(p.x/this.a);iflg=phi4z(this.es,this.e0,this.e1,this.e2,this.e3,this.al,b,c,lat);if(iflg!=1)return(iflg);lon=Proj4js.common.adjust_lon((Proj4js.common.asinz(p.x*c/this.a)/Math.sin(lat))+this.long0);}
p.x=lon;p.y=lat;return p;}};Proj4js.Proj.equi={init:function(){if(!this.x0)this.x0=0;if(!this.y0)this.y0=0;if(!this.lat0)this.lat0=0;if(!this.long0)this.long0=0;},forward:function(p){var lon=p.x;var lat=p.y;var dlon=Proj4js.common.adjust_lon(lon-this.long0);var x=this.x0+this.a*dlon*Math.cos(this.lat0);var y=this.y0+this.a*lat;this.t1=x;this.t2=Math.cos(this.lat0);p.x=x;p.y=y;return p;},inverse:function(p){p.x-=this.x0;p.y-=this.y0;var lat=p.y/this.a;if(Math.abs(lat)>Proj4js.common.HALF_PI){Proj4js.reportError("equi:Inv:DataError");}
var lon=Proj4js.common.adjust_lon(this.long0+p.x/(this.a*Math.cos(this.lat0)));p.x=lon;p.y=lat;}};Proj4js.Proj.merc={init:function(){if(this.lat_ts){if(this.sphere){this.k0=Math.cos(this.lat_ts);}else{this.k0=Proj4js.common.msfnz(this.es,Math.sin(this.lat_ts),Math.cos(this.lat_ts));}}},forward:function(p){var lon=p.x;var lat=p.y;if(lat*Proj4js.common.R2D>90.0&&lat*Proj4js.common.R2D<-90.0&&lon*Proj4js.common.R2D>180.0&&lon*Proj4js.common.R2D<-180.0){Proj4js.reportError("merc:forward: llInputOutOfRange: "+lon+" : "+lat);return null;}
var x,y;if(Math.abs(Math.abs(lat)-Proj4js.common.HALF_PI)<=Proj4js.common.EPSLN){Proj4js.reportError("merc:forward: ll2mAtPoles");return null;}else{if(this.sphere){x=this.x0+this.a*this.k0*Proj4js.common.adjust_lon(lon-this.long0);y=this.y0+this.a*this.k0*Math.log(Math.tan(Proj4js.common.FORTPI+0.5*lat));}else{var sinphi=Math.sin(lat);var ts=Proj4js.common.tsfnz(this.e,lat,sinphi);x=this.x0+this.a*this.k0*Proj4js.common.adjust_lon(lon-this.long0);y=this.y0-this.a*this.k0*Math.log(ts);}
p.x=x;p.y=y;return p;}},inverse:function(p){var x=p.x-this.x0;var y=p.y-this.y0;var lon,lat;if(this.sphere){lat=Proj4js.common.HALF_PI-2.0*Math.atan(Math.exp(-y/this.a*this.k0));}else{var ts=Math.exp(-y/(this.a*this.k0));lat=Proj4js.common.phi2z(this.e,ts);if(lat==-9999){Proj4js.reportError("merc:inverse: lat = -9999");return null;}}
lon=Proj4js.common.adjust_lon(this.long0+x/(this.a*this.k0));p.x=lon;p.y=lat;return p;}};Proj4js.Proj.utm={dependsOn:'tmerc',init:function(){if(!this.zone){Proj4js.reportError("utm:init: zone must be specified for UTM");return;}
this.lat0=0.0;this.long0=((6*Math.abs(this.zone))-183)*Proj4js.common.D2R;this.x0=500000.0;this.y0=this.utmSouth?10000000.0:0.0;this.k0=0.9996;Proj4js.Proj['tmerc'].init.apply(this);this.forward=Proj4js.Proj['tmerc'].forward;this.inverse=Proj4js.Proj['tmerc'].inverse;}};Proj4js.Proj.eqdc={init:function(){if(!this.mode)this.mode=0;this.temp=this.b/this.a;this.es=1.0-Math.pow(this.temp,2);this.e=Math.sqrt(this.es);this.e0=Proj4js.common.e0fn(this.es);this.e1=Proj4js.common.e1fn(this.es);this.e2=Proj4js.common.e2fn(this.es);this.e3=Proj4js.common.e3fn(this.es);this.sinphi=Math.sin(this.lat1);this.cosphi=Math.cos(this.lat1);this.ms1=Proj4js.common.msfnz(this.e,this.sinphi,this.cosphi);this.ml1=Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat1);if(this.mode!=0){if(Math.abs(this.lat1+this.lat2)<Proj4js.common.EPSLN){Proj4js.reportError("eqdc:Init:EqualLatitudes");}
this.sinphi=Math.sin(this.lat2);this.cosphi=Math.cos(this.lat2);this.ms2=Proj4js.common.msfnz(this.e,this.sinphi,this.cosphi);this.ml2=Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat2);if(Math.abs(this.lat1-this.lat2)>=Proj4js.common.EPSLN){this.ns=(this.ms1-this.ms2)/(this.ml2-this.ml1);}else{this.ns=this.sinphi;}}else{this.ns=this.sinphi;}
this.g=this.ml1+this.ms1/this.ns;this.ml0=Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat0);this.rh=this.a*(this.g-this.ml0);},forward:function(p){var lon=p.x;var lat=p.y;var ml=Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,lat);var rh1=this.a*(this.g-ml);var theta=this.ns*Proj4js.common.adjust_lon(lon-this.long0);var x=this.x0+rh1*Math.sin(theta);var y=this.y0+this.rh-rh1*Math.cos(theta);p.x=x;p.y=y;return p;},inverse:function(p){p.x-=this.x0;p.y=this.rh-p.y+this.y0;var con,rh1;if(this.ns>=0){var rh1=Math.sqrt(p.x*p.x+p.y*p.y);var con=1.0;}else{rh1=-Math.sqrt(p.x*p.x+p.y*p.y);con=-1.0;}
var theta=0.0;if(rh1!=0.0)theta=Math.atan2(con*p.x,con*p.y);var ml=this.g-rh1/this.a;var lat=this.phi3z(this.ml,this.e0,this.e1,this.e2,this.e3);var lon=Proj4js.common.adjust_lon(this.long0+theta/this.ns);p.x=lon;p.y=lat;return p;},phi3z:function(ml,e0,e1,e2,e3){var phi;var dphi;phi=ml;for(var i=0;i<15;i++){dphi=(ml+e1*Math.sin(2.0*phi)-e2*Math.sin(4.0*phi)+e3*Math.sin(6.0*phi))/e0-phi;phi+=dphi;if(Math.abs(dphi)<=.0000000001){return phi;}}
Proj4js.reportError("PHI3Z-CONV:Latitude failed to converge after 15 iterations");return null;}};Proj4js.Proj.tmerc={init:function(){this.e0=Proj4js.common.e0fn(this.es);this.e1=Proj4js.common.e1fn(this.es);this.e2=Proj4js.common.e2fn(this.es);this.e3=Proj4js.common.e3fn(this.es);this.ml0=this.a*Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,this.lat0);},forward:function(p){var lon=p.x;var lat=p.y;var delta_lon=Proj4js.common.adjust_lon(lon-this.long0);var con;var x,y;var sin_phi=Math.sin(lat);var cos_phi=Math.cos(lat);if(this.sphere){var b=cos_phi*Math.sin(delta_lon);if((Math.abs(Math.abs(b)-1.0))<.0000000001){Proj4js.reportError("tmerc:forward: Point projects into infinity");return(93);}else{x=.5*this.a*this.k0*Math.log((1.0+b)/(1.0-b));con=Math.acos(cos_phi*Math.cos(delta_lon)/Math.sqrt(1.0-b*b));if(lat<0)con=-con;y=this.a*this.k0*(con-this.lat0);}}else{var al=cos_phi*delta_lon;var als=Math.pow(al,2);var c=this.ep2*Math.pow(cos_phi,2);var tq=Math.tan(lat);var t=Math.pow(tq,2);con=1.0-this.es*Math.pow(sin_phi,2);var n=this.a/Math.sqrt(con);var ml=this.a*Proj4js.common.mlfn(this.e0,this.e1,this.e2,this.e3,lat);x=this.k0*n*al*(1.0+als/6.0*(1.0-t+c+als/20.0*(5.0-18.0*t+Math.pow(t,2)+72.0*c-58.0*this.ep2)))+this.x0;y=this.k0*(ml-this.ml0+n*tq*(als*(0.5+als/24.0*(5.0-t+9.0*c+4.0*Math.pow(c,2)+als/30.0*(61.0-58.0*t+Math.pow(t,2)+600.0*c-330.0*this.ep2)))))+this.y0;}
p.x=x;p.y=y;return p;},inverse:function(p){var con,phi;var delta_phi;var i;var max_iter=6;var lat,lon;if(this.sphere){var f=Math.exp(p.x/(this.a*this.k0));var g=.5*(f-1/f);var temp=this.lat0+p.y/(this.a*this.k0);var h=Math.cos(temp);con=Math.sqrt((1.0-h*h)/(1.0+g*g));lat=Proj4js.common.asinz(con);if(temp<0)
lat=-lat;if((g==0)&&(h==0)){lon=this.long0;}else{lon=Proj4js.common.adjust_lon(Math.atan2(g,h)+this.long0);}}else{var x=p.x-this.x0;var y=p.y-this.y0;con=(this.ml0+y/this.k0)/this.a;phi=con;for(i=0;true;i++){delta_phi=((con+this.e1*Math.sin(2.0*phi)-this.e2*Math.sin(4.0*phi)+this.e3*Math.sin(6.0*phi))/this.e0)-phi;phi+=delta_phi;if(Math.abs(delta_phi)<=Proj4js.common.EPSLN)break;if(i>=max_iter){Proj4js.reportError("tmerc:inverse: Latitude failed to converge");return(95);}}
if(Math.abs(phi)<Proj4js.common.HALF_PI){var sin_phi=Math.sin(phi);var cos_phi=Math.cos(phi);var tan_phi=Math.tan(phi);var c=this.ep2*Math.pow(cos_phi,2);var cs=Math.pow(c,2);var t=Math.pow(tan_phi,2);var ts=Math.pow(t,2);con=1.0-this.es*Math.pow(sin_phi,2);var n=this.a/Math.sqrt(con);var r=n*(1.0-this.es)/con;var d=x/(n*this.k0);var ds=Math.pow(d,2);lat=phi-(n*tan_phi*ds/r)*(0.5-ds/24.0*(5.0+3.0*t+10.0*c-4.0*cs-9.0*this.ep2-ds/30.0*(61.0+90.0*t+298.0*c+45.0*ts-252.0*this.ep2-3.0*cs)));lon=Proj4js.common.adjust_lon(this.long0+(d*(1.0-ds/6.0*(1.0+2.0*t+c-ds/20.0*(5.0-2.0*c+28.0*t-3.0*cs+8.0*this.ep2+24.0*ts)))/cos_phi));}else{lat=Proj4js.common.HALF_PI*Proj4js.common.sign(y);lon=this.long0;}}
p.x=lon;p.y=lat;return p;}};Proj4js.defs["GOOGLE"]="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";Proj4js.defs["EPSG:900913"]=Proj4js.defs["GOOGLE"];Proj4js.Proj.gstmerc={init:function(){var temp=this.b/this.a;this.e=Math.sqrt(1.0-temp*temp);this.lc=this.long0;this.rs=Math.sqrt(1.0+this.e*this.e*Math.pow(Math.cos(this.lat0),4.0)/(1.0-this.e*this.e));var sinz=Math.sin(this.lat0);var pc=Math.asin(sinz/this.rs);var sinzpc=Math.sin(pc);this.cp=Proj4js.common.latiso(0.0,pc,sinzpc)-this.rs*Proj4js.common.latiso(this.e,this.lat0,sinz);this.n2=this.k0*this.a*Math.sqrt(1.0-this.e*this.e)/(1.0-this.e*this.e*sinz*sinz);this.xs=this.x0;this.ys=this.y0-this.n2*pc;if(!this.title)this.title="Gauss Schreiber transverse mercator";},forward:function(p){var lon=p.x;var lat=p.y;var L=this.rs*(lon-this.lc);var Ls=this.cp+(this.rs*Proj4js.common.latiso(this.e,lat,Math.sin(lat)));var lat1=Math.asin(Math.sin(L)/Proj4js.common.cosh(Ls));var Ls1=Proj4js.common.latiso(0.0,lat1,Math.sin(lat1));p.x=this.xs+(this.n2*Ls1);p.y=this.ys+(this.n2*Math.atan(Proj4js.common.sinh(Ls)/Math.cos(L)));return p;},inverse:function(p){var x=p.x;var y=p.y;var L=Math.atan(Proj4js.common.sinh((x-this.xs)/this.n2)/Math.cos((y-this.ys)/this.n2));var lat1=Math.asin(Math.sin((y-this.ys)/this.n2)/Proj4js.common.cosh((x-this.xs)/this.n2));var LC=Proj4js.common.latiso(0.0,lat1,Math.sin(lat1));p.x=this.lc+L/this.rs;p.y=Proj4js.common.invlatiso(this.e,(LC-this.cp)/this.rs);return p;}};Proj4js.Proj.ortho={init:function(def){;this.sin_p14=Math.sin(this.lat0);this.cos_p14=Math.cos(this.lat0);},forward:function(p){var sinphi,cosphi;var dlon;var coslon;var ksp;var g;var lon=p.x;var lat=p.y;dlon=Proj4js.common.adjust_lon(lon-this.long0);sinphi=Math.sin(lat);cosphi=Math.cos(lat);coslon=Math.cos(dlon);g=this.sin_p14*sinphi+this.cos_p14*cosphi*coslon;ksp=1.0;if((g>0)||(Math.abs(g)<=Proj4js.common.EPSLN)){var x=this.a*ksp*cosphi*Math.sin(dlon);var y=this.y0+this.a*ksp*(this.cos_p14*sinphi-this.sin_p14*cosphi*coslon);}else{Proj4js.reportError("orthoFwdPointError");}
p.x=x;p.y=y;return p;},inverse:function(p){var rh;var z;var sinz,cosz;var temp;var con;var lon,lat;p.x-=this.x0;p.y-=this.y0;rh=Math.sqrt(p.x*p.x+p.y*p.y);if(rh>this.a+.0000001){Proj4js.reportError("orthoInvDataError");}
z=Proj4js.common.asinz(rh/this.a);sinz=Math.sin(z);cosz=Math.cos(z);lon=this.long0;if(Math.abs(rh)<=Proj4js.common.EPSLN){lat=this.lat0;}
lat=Proj4js.common.asinz(cosz*this.sin_p14+(p.y*sinz*this.cos_p14)/rh);con=Math.abs(lat0)-Proj4js.common.HALF_PI;if(Math.abs(con)<=Proj4js.common.EPSLN){if(this.lat0>=0){lon=Proj4js.common.adjust_lon(this.long0+Math.atan2(p.x,-p.y));}else{lon=Proj4js.common.adjust_lon(this.long0-Math.atan2(-p.x,p.y));}}
con=cosz-this.sin_p14*Math.sin(lat);if((Math.abs(con)>=Proj4js.common.EPSLN)||(Math.abs(x)>=Proj4js.common.EPSLN)){lon=Proj4js.common.adjust_lon(this.long0+Math.atan2((p.x*sinz*this.cos_p14),(con*rh)));}
p.x=lon;p.y=lat;return p;}};Proj4js.Proj.somerc={init:function(){var phy0=this.lat0;this.lambda0=this.long0;var sinPhy0=Math.sin(phy0);var semiMajorAxis=this.a;var invF=this.rf;var flattening=1/invF;var e2=2*flattening-Math.pow(flattening,2);var e=this.e=Math.sqrt(e2);this.R=semiMajorAxis*Math.sqrt(1-e2)/(1-e2*Math.pow(sinPhy0,2.0));this.alpha=Math.sqrt(1+e2/(1-e2)*Math.pow(Math.cos(phy0),4.0));this.b0=Math.asin(sinPhy0/this.alpha);this.K=Math.log(Math.tan(Math.PI/4.0+this.b0/2.0))
-this.alpha*Math.log(Math.tan(Math.PI/4.0+phy0/2.0))
+this.alpha*e/2*Math.log((1+e*sinPhy0)/(1-e*sinPhy0));},forward:function(p){var Sa1=Math.log(Math.tan(Math.PI/4.0-p.y/2.0));var Sa2=this.e/2.0*Math.log((1+this.e*Math.sin(p.y))/(1-this.e*Math.sin(p.y)));var S=-this.alpha*(Sa1+Sa2)+this.K;var b=2.0*(Math.atan(Math.exp(S))-Math.PI/4.0);var I=this.alpha*(p.x-this.lambda0);var rotI=Math.atan(Math.sin(I)/(Math.sin(this.b0)*Math.tan(b)+
Math.cos(this.b0)*Math.cos(I)));var rotB=Math.asin(Math.cos(this.b0)*Math.sin(b)-
Math.sin(this.b0)*Math.cos(b)*Math.cos(I));p.y=this.R/2.0*Math.log((1+Math.sin(rotB))/(1-Math.sin(rotB)))
+this.y0;p.x=this.R*rotI+this.x0;return p;},inverse:function(p){var Y=p.x-this.x0;var X=p.y-this.y0;var rotI=Y/this.R;var rotB=2*(Math.atan(Math.exp(X/this.R))-Math.PI/4.0);var b=Math.asin(Math.cos(this.b0)*Math.sin(rotB)
+Math.sin(this.b0)*Math.cos(rotB)*Math.cos(rotI));var I=Math.atan(Math.sin(rotI)/(Math.cos(this.b0)*Math.cos(rotI)-Math.sin(this.b0)*Math.tan(rotB)));var lambda=this.lambda0+I/this.alpha;var S=0.0;var phy=b;var prevPhy=-1000.0;var iteration=0;while(Math.abs(phy-prevPhy)>0.0000001)
{if(++iteration>20)
{Proj4js.reportError("omercFwdInfinity");return;}
S=1.0/this.alpha*(Math.log(Math.tan(Math.PI/4.0+b/2.0))-this.K)
+this.e*Math.log(Math.tan(Math.PI/4.0
+Math.asin(this.e*Math.sin(phy))/2.0));prevPhy=phy;phy=2.0*Math.atan(Math.exp(S))-Math.PI/2.0;}
p.x=lambda;p.y=phy;return p;}};Proj4js.Proj.stere={ssfn_:function(phit,sinphi,eccen){sinphi*=eccen;return(Math.tan(.5*(Proj4js.common.HALF_PI+phit))*Math.pow((1.-sinphi)/(1.+sinphi),.5*eccen));},TOL:1.e-8,NITER:8,CONV:1.e-10,S_POLE:0,N_POLE:1,OBLIQ:2,EQUIT:3,init:function(){this.phits=this.lat_ts?this.lat_ts:Proj4js.common.HALF_PI;var t=Math.abs(this.lat0);if((Math.abs(t)-Proj4js.common.HALF_PI)<Proj4js.common.EPSLN){this.mode=this.lat0<0.?this.S_POLE:this.N_POLE;}else{this.mode=t>Proj4js.common.EPSLN?this.OBLIQ:this.EQUIT;}
this.phits=Math.abs(this.phits);if(this.es){var X;switch(this.mode){case this.N_POLE:case this.S_POLE:if(Math.abs(this.phits-Proj4js.common.HALF_PI)<Proj4js.common.EPSLN){this.akm1=2.*this.k0/Math.sqrt(Math.pow(1+this.e,1+this.e)*Math.pow(1-this.e,1-this.e));}else{t=Math.sin(this.phits);this.akm1=Math.cos(this.phits)/Proj4js.common.tsfnz(this.e,this.phits,t);t*=this.e;this.akm1/=Math.sqrt(1.-t*t);}
break;case this.EQUIT:this.akm1=2.*this.k0;break;case this.OBLIQ:t=Math.sin(this.lat0);X=2.*Math.atan(this.ssfn_(this.lat0,t,this.e))-Proj4js.common.HALF_PI;t*=this.e;this.akm1=2.*this.k0*Math.cos(this.lat0)/Math.sqrt(1.-t*t);this.sinX1=Math.sin(X);this.cosX1=Math.cos(X);break;}}else{switch(this.mode){case this.OBLIQ:this.sinph0=Math.sin(this.lat0);this.cosph0=Math.cos(this.lat0);case this.EQUIT:this.akm1=2.*this.k0;break;case this.S_POLE:case this.N_POLE:this.akm1=Math.abs(this.phits-Proj4js.common.HALF_PI)>=Proj4js.common.EPSLN?Math.cos(this.phits)/Math.tan(Proj4js.common.FORTPI-.5*this.phits):2.*this.k0;break;}}},forward:function(p){var lon=p.x;lon=Proj4js.common.adjust_lon(lon-this.long0);var lat=p.y;var x,y;if(this.sphere){var sinphi,cosphi,coslam,sinlam;sinphi=Math.sin(lat);cosphi=Math.cos(lat);coslam=Math.cos(lon);sinlam=Math.sin(lon);switch(this.mode){case this.EQUIT:y=1.+cosphi*coslam;if(y<=Proj4js.common.EPSLN){F_ERROR;}
y=this.akm1/y;x=y*cosphi*sinlam;y*=sinphi;break;case this.OBLIQ:y=1.+this.sinph0*sinphi+this.cosph0*cosphi*coslam;if(y<=Proj4js.common.EPSLN){F_ERROR;}
y=this.akm1/y;x=y*cosphi*sinlam;y*=this.cosph0*sinphi-this.sinph0*cosphi*coslam;break;case this.N_POLE:coslam=-coslam;lat=-lat;case this.S_POLE:if(Math.abs(lat-Proj4js.common.HALF_PI)<this.TOL){F_ERROR;}
y=this.akm1*Math.tan(Proj4js.common.FORTPI+.5*lat);x=sinlam*y;y*=coslam;break;}}else{coslam=Math.cos(lon);sinlam=Math.sin(lon);sinphi=Math.sin(lat);if(this.mode==this.OBLIQ||this.mode==this.EQUIT){X=2.*Math.atan(this.ssfn_(lat,sinphi,this.e));sinX=Math.sin(X-Proj4js.common.HALF_PI);cosX=Math.cos(X);}
switch(this.mode){case this.OBLIQ:A=this.akm1/(this.cosX1*(1.+this.sinX1*sinX+this.cosX1*cosX*coslam));y=A*(this.cosX1*sinX-this.sinX1*cosX*coslam);x=A*cosX;break;case this.EQUIT:A=2.*this.akm1/(1.+cosX*coslam);y=A*sinX;x=A*cosX;break;case this.S_POLE:lat=-lat;coslam=-coslam;sinphi=-sinphi;case this.N_POLE:x=this.akm1*Proj4js.common.tsfnz(this.e,lat,sinphi);y=-x*coslam;break;}
x=x*sinlam;}
p.x=x*this.a+this.x0;p.y=y*this.a+this.y0;return p;},inverse:function(p){var x=(p.x-this.x0)/this.a;var y=(p.y-this.y0)/this.a;var lon,lat;var cosphi,sinphi,tp=0.0,phi_l=0.0,rho,halfe=0.0,pi2=0.0;var i;if(this.sphere){var c,rh,sinc,cosc;rh=Math.sqrt(x*x+y*y);c=2.*Math.atan(rh/this.akm1);sinc=Math.sin(c);cosc=Math.cos(c);lon=0.;switch(this.mode){case this.EQUIT:if(Math.abs(rh)<=Proj4js.common.EPSLN){lat=0.;}else{lat=Math.asin(y*sinc/rh);}
if(cosc!=0.||x!=0.)lon=Math.atan2(x*sinc,cosc*rh);break;case this.OBLIQ:if(Math.abs(rh)<=Proj4js.common.EPSLN){lat=this.phi0;}else{lat=Math.asin(cosc*sinph0+y*sinc*cosph0/rh);}
c=cosc-sinph0*Math.sin(lat);if(c!=0.||x!=0.){lon=Math.atan2(x*sinc*cosph0,c*rh);}
break;case this.N_POLE:y=-y;case this.S_POLE:if(Math.abs(rh)<=Proj4js.common.EPSLN){lat=this.phi0;}else{lat=Math.asin(this.mode==this.S_POLE?-cosc:cosc);}
lon=(x==0.&&y==0.)?0.:Math.atan2(x,y);break;}}else{rho=Math.sqrt(x*x+y*y);switch(this.mode){case this.OBLIQ:case this.EQUIT:tp=2.*Math.atan2(rho*this.cosX1,this.akm1);cosphi=Math.cos(tp);sinphi=Math.sin(tp);if(rho==0.0){phi_l=Math.asin(cosphi*this.sinX1);}else{phi_l=Math.asin(cosphi*this.sinX1+(y*sinphi*this.cosX1/rho));}
tp=Math.tan(.5*(Proj4js.common.HALF_PI+phi_l));x*=sinphi;y=rho*this.cosX1*cosphi-y*this.sinX1*sinphi;pi2=Proj4js.common.HALF_PI;halfe=.5*this.e;break;case this.N_POLE:y=-y;case this.S_POLE:tp=-rho/this.akm1;phi_l=Proj4js.common.HALF_PI-2.*Math.atan(tp);pi2=-Proj4js.common.HALF_PI;halfe=-.5*this.e;break;}
for(i=this.NITER;i--;phi_l=lat){sinphi=this.e*Math.sin(phi_l);lat=2.*Math.atan(tp*Math.pow((1.+sinphi)/(1.-sinphi),halfe))-pi2;if(Math.abs(phi_l-lat)<this.CONV){if(this.mode==this.S_POLE)lat=-lat;lon=(x==0.&&y==0.)?0.:Math.atan2(x,y);p.x=Proj4js.common.adjust_lon(lon+this.long0);p.y=lat;return p;}}}}};Proj4js.Proj.nzmg={iterations:1,init:function(){this.A=new Array();this.A[1]=+0.6399175073;this.A[2]=-0.1358797613;this.A[3]=+0.063294409;this.A[4]=-0.02526853;this.A[5]=+0.0117879;this.A[6]=-0.0055161;this.A[7]=+0.0026906;this.A[8]=-0.001333;this.A[9]=+0.00067;this.A[10]=-0.00034;this.B_re=new Array();this.B_im=new Array();this.B_re[1]=+0.7557853228;this.B_im[1]=0.0;this.B_re[2]=+0.249204646;this.B_im[2]=+0.003371507;this.B_re[3]=-0.001541739;this.B_im[3]=+0.041058560;this.B_re[4]=-0.10162907;this.B_im[4]=+0.01727609;this.B_re[5]=-0.26623489;this.B_im[5]=-0.36249218;this.B_re[6]=-0.6870983;this.B_im[6]=-1.1651967;this.C_re=new Array();this.C_im=new Array();this.C_re[1]=+1.3231270439;this.C_im[1]=0.0;this.C_re[2]=-0.577245789;this.C_im[2]=-0.007809598;this.C_re[3]=+0.508307513;this.C_im[3]=-0.112208952;this.C_re[4]=-0.15094762;this.C_im[4]=+0.18200602;this.C_re[5]=+1.01418179;this.C_im[5]=+1.64497696;this.C_re[6]=+1.9660549;this.C_im[6]=+2.5127645;this.D=new Array();this.D[1]=+1.5627014243;this.D[2]=+0.5185406398;this.D[3]=-0.03333098;this.D[4]=-0.1052906;this.D[5]=-0.0368594;this.D[6]=+0.007317;this.D[7]=+0.01220;this.D[8]=+0.00394;this.D[9]=-0.0013;},forward:function(p){var lon=p.x;var lat=p.y;var delta_lat=lat-this.lat0;var delta_lon=lon-this.long0;var d_phi=delta_lat/Proj4js.common.SEC_TO_RAD*1E-5;var d_lambda=delta_lon;var d_phi_n=1;var d_psi=0;for(n=1;n<=10;n++){d_phi_n=d_phi_n*d_phi;d_psi=d_psi+this.A[n]*d_phi_n;}
var th_re=d_psi;var th_im=d_lambda;var th_n_re=1;var th_n_im=0;var th_n_re1;var th_n_im1;var z_re=0;var z_im=0;for(n=1;n<=6;n++){th_n_re1=th_n_re*th_re-th_n_im*th_im;th_n_im1=th_n_im*th_re+th_n_re*th_im;th_n_re=th_n_re1;th_n_im=th_n_im1;z_re=z_re+this.B_re[n]*th_n_re-this.B_im[n]*th_n_im;z_im=z_im+this.B_im[n]*th_n_re+this.B_re[n]*th_n_im;}
x=(z_im*this.a)+this.x0;y=(z_re*this.a)+this.y0;p.x=x;p.y=y;return p;},inverse:function(p){var x=p.x;var y=p.y;var delta_x=x-this.x0;var delta_y=y-this.y0;var z_re=delta_y/this.a;var z_im=delta_x/this.a;var z_n_re=1;var z_n_im=0;var z_n_re1;var z_n_im1;var th_re=0;var th_im=0;for(n=1;n<=6;n++){z_n_re1=z_n_re*z_re-z_n_im*z_im;z_n_im1=z_n_im*z_re+z_n_re*z_im;z_n_re=z_n_re1;z_n_im=z_n_im1;th_re=th_re+this.C_re[n]*z_n_re-this.C_im[n]*z_n_im;th_im=th_im+this.C_im[n]*z_n_re+this.C_re[n]*z_n_im;}
for(i=0;i<this.iterations;i++){var th_n_re=th_re;var th_n_im=th_im;var th_n_re1;var th_n_im1;var num_re=z_re;var num_im=z_im;for(n=2;n<=6;n++){th_n_re1=th_n_re*th_re-th_n_im*th_im;th_n_im1=th_n_im*th_re+th_n_re*th_im;th_n_re=th_n_re1;th_n_im=th_n_im1;num_re=num_re+(n-1)*(this.B_re[n]*th_n_re-this.B_im[n]*th_n_im);num_im=num_im+(n-1)*(this.B_im[n]*th_n_re+this.B_re[n]*th_n_im);}
th_n_re=1;th_n_im=0;var den_re=this.B_re[1];var den_im=this.B_im[1];for(n=2;n<=6;n++){th_n_re1=th_n_re*th_re-th_n_im*th_im;th_n_im1=th_n_im*th_re+th_n_re*th_im;th_n_re=th_n_re1;th_n_im=th_n_im1;den_re=den_re+n*(this.B_re[n]*th_n_re-this.B_im[n]*th_n_im);den_im=den_im+n*(this.B_im[n]*th_n_re+this.B_re[n]*th_n_im);}
var den2=den_re*den_re+den_im*den_im;th_re=(num_re*den_re+num_im*den_im)/den2;th_im=(num_im*den_re-num_re*den_im)/den2;}
var d_psi=th_re;var d_lambda=th_im;var d_psi_n=1;var d_phi=0;for(n=1;n<=9;n++){d_psi_n=d_psi_n*d_psi;d_phi=d_phi+this.D[n]*d_psi_n;}
var lat=this.lat0+(d_phi*Proj4js.common.SEC_TO_RAD*1E5);var lon=this.long0+d_lambda;p.x=lon;p.y=lat;return p;}};Proj4js.Proj.mill={init:function(){},forward:function(p){var lon=p.x;var lat=p.y;var dlon=Proj4js.common.adjust_lon(lon-this.long0);var x=this.x0+this.a*dlon;var y=this.y0+this.a*Math.log(Math.tan((Proj4js.common.PI/4.0)+(lat/2.5)))*1.25;p.x=x;p.y=y;return p;},inverse:function(p){p.x-=this.x0;p.y-=this.y0;var lon=Proj4js.common.adjust_lon(this.long0+p.x/this.a);var lat=2.5*(Math.atan(Math.exp(0.8*p.y/this.a))-Proj4js.common.PI/4.0);p.x=lon;p.y=lat;return p;}};Proj4js.Proj.gnom={init:function(def){this.sin_p14=Math.sin(this.lat0);this.cos_p14=Math.cos(this.lat0);this.infinity_dist=1000*this.a;},forward:function(p){var sinphi,cosphi;var dlon;var coslon;var ksp;var g;var lon=p.x;var lat=p.y;dlon=Proj4js.common.adjust_lon(lon-this.long0);sinphi=Math.sin(lat);cosphi=Math.cos(lat);coslon=Math.cos(dlon);g=this.sin_p14*sinphi+this.cos_p14*cosphi*coslon;ksp=1.0;if((g>0)||(Math.abs(g)<=Proj4js.common.EPSLN)){x=this.x0+this.a*ksp*cosphi*Math.sin(dlon)/g;y=this.y0+this.a*ksp*(this.cos_p14*sinphi-this.sin_p14*cosphi*coslon)/g;}else{Proj4js.reportError("orthoFwdPointError");x=this.x0+this.infinity_dist*cosphi*Math.sin(dlon);y=this.y0+this.infinity_dist*(this.cos_p14*sinphi-this.sin_p14*cosphi*coslon);}
p.x=x;p.y=y;return p;},inverse:function(p){var rh;var z;var sinc,cosc;var c;var lon,lat;p.x=(p.x-this.x0)/this.a;p.y=(p.y-this.y0)/this.a;p.x/=this.k0;p.y/=this.k0;if((rh=Math.sqrt(p.x*p.x+p.y*p.y))){c=Math.atan2(rh,this.rc);sinc=Math.sin(c);cosc=Math.cos(c);lat=Proj4js.common.asinz(cosc*this.sin_p14+(p.y*sinc*this.cos_p14)/rh);lon=Math.atan2(p.x*sinc,rh*this.cos_p14*cosc-p.y*this.sin_p14*sinc);lon=Proj4js.common.adjust_lon(this.long0+lon);}else{lat=this.phic0;lon=0.0;}
p.x=lon;p.y=lat;return p;}};Proj4js.Proj.sinu={init:function(){this.R=6370997.0;},forward:function(p){var x,y,delta_lon;var lon=p.x;var lat=p.y;delta_lon=Proj4js.common.adjust_lon(lon-this.long0);x=this.R*delta_lon*Math.cos(lat)+this.x0;y=this.R*lat+this.y0;p.x=x;p.y=y;return p;},inverse:function(p){var lat,temp,lon;p.x-=this.x0;p.y-=this.y0;lat=p.y/this.R;if(Math.abs(lat)>Proj4js.common.HALF_PI){Proj4js.reportError("sinu:Inv:DataError");}
temp=Math.abs(lat)-Proj4js.common.HALF_PI;if(Math.abs(temp)>Proj4js.common.EPSLN){temp=this.long0+p.x/(this.R*Math.cos(lat));lon=Proj4js.common.adjust_lon(temp);}else{lon=this.long0;}
p.x=lon;p.y=lat;return p;}};Proj4js.Proj.vandg={init:function(){this.R=6370997.0;},forward:function(p){var lon=p.x;var lat=p.y;var dlon=Proj4js.common.adjust_lon(lon-this.long0);var x,y;if(Math.abs(lat)<=Proj4js.common.EPSLN){x=this.x0+this.R*dlon;y=this.y0;}
var theta=Proj4js.common.asinz(2.0*Math.abs(lat/Proj4js.common.PI));if((Math.abs(dlon)<=Proj4js.common.EPSLN)||(Math.abs(Math.abs(lat)-Proj4js.common.HALF_PI)<=Proj4js.common.EPSLN)){x=this.x0;if(lat>=0){y=this.y0+Proj4js.common.PI*this.R*Math.tan(.5*theta);}else{y=this.y0+Proj4js.common.PI*this.R*-Math.tan(.5*theta);}}
var al=.5*Math.abs((Proj4js.common.PI/dlon)-(dlon/Proj4js.common.PI));var asq=al*al;var sinth=Math.sin(theta);var costh=Math.cos(theta);var g=costh/(sinth+costh-1.0);var gsq=g*g;var m=g*(2.0/sinth-1.0);var msq=m*m;var con=Proj4js.common.PI*this.R*(al*(g-msq)+Math.sqrt(asq*(g-msq)*(g-msq)-(msq+asq)*(gsq-msq)))/(msq+asq);if(dlon<0){con=-con;}
x=this.x0+con;con=Math.abs(con/(Proj4js.common.PI*this.R));if(lat>=0){y=this.y0+Proj4js.common.PI*this.R*Math.sqrt(1.0-con*con-2.0*al*con);}else{y=this.y0-Proj4js.common.PI*this.R*Math.sqrt(1.0-con*con-2.0*al*con);}
p.x=x;p.y=y;return p;},inverse:function(p){var dlon;var xx,yy,xys,c1,c2,c3;var al,asq;var a1;var m1;var con;var th1;var d;p.x-=this.x0;p.y-=this.y0;con=Proj4js.common.PI*this.R;xx=p.x/con;yy=p.y/con;xys=xx*xx+yy*yy;c1=-Math.abs(yy)*(1.0+xys);c2=c1-2.0*yy*yy+xx*xx;c3=-2.0*c1+1.0+2.0*yy*yy+xys*xys;d=yy*yy/c3+(2.0*c2*c2*c2/c3/c3/c3-9.0*c1*c2/c3/c3)/27.0;a1=(c1-c2*c2/3.0/c3)/c3;m1=2.0*Math.sqrt(-a1/3.0);con=((3.0*d)/a1)/m1;if(Math.abs(con)>1.0){if(con>=0.0){con=1.0;}else{con=-1.0;}}
th1=Math.acos(con)/3.0;if(p.y>=0){lat=(-m1*Math.cos(th1+Proj4js.common.PI/3.0)-c2/3.0/c3)*Proj4js.common.PI;}else{lat=-(-m1*Math.cos(th1+PI/3.0)-c2/3.0/c3)*Proj4js.common.PI;}
if(Math.abs(xx)<Proj4js.common.EPSLN){lon=this.long0;}
lon=Proj4js.common.adjust_lon(this.long0+Proj4js.common.PI*(xys-1.0+Math.sqrt(1.0+2.0*(xx*xx-yy*yy)+xys*xys))/2.0/xx);p.x=lon;p.y=lat;return p;}};Proj4js.Proj.cea={init:function(){},forward:function(p){var lon=p.x;var lat=p.y;dlon=Proj4js.common.adjust_lon(lon-this.long0);var x=this.x0+this.a*dlon*Math.cos(this.lat_ts);var y=this.y0+this.a*Math.sin(lat)/Math.cos(this.lat_ts);p.x=x;p.y=y;return p;},inverse:function(p){p.x-=this.x0;p.y-=this.y0;var lon=Proj4js.common.adjust_lon(this.long0+(p.x/this.a)/Math.cos(this.lat_ts));var lat=Math.asin((p.y/this.a)*Math.cos(this.lat_ts));p.x=lon;p.y=lat;return p;}};Proj4js.Proj.eqc={init:function(){if(!this.x0)this.x0=0;if(!this.y0)this.y0=0;if(!this.lat0)this.lat0=0;if(!this.long0)this.long0=0;if(!this.lat_ts)this.lat_ts=0;if(!this.title)this.title="Equidistant Cylindrical (Plate Carre)";this.rc=Math.cos(this.lat_ts);},forward:function(p){var lon=p.x;var lat=p.y;var dlon=Proj4js.common.adjust_lon(lon-this.long0);var dlat=Proj4js.common.adjust_lat(lat-this.lat0);p.x=this.x0+(this.a*dlon*this.rc);p.y=this.y0+(this.a*dlat);return p;},inverse:function(p){var x=p.x;var y=p.y;p.x=Proj4js.common.adjust_lon(this.long0+((x-this.x0)/(this.a*this.rc)));p.y=Proj4js.common.adjust_lat(this.lat0+((y-this.y0)/(this.a)));return p;}};Proj4js.Proj.cass={init:function(){if(!this.sphere){this.en=this.pj_enfn(this.es)
this.m0=this.pj_mlfn(this.lat0,Math.sin(this.lat0),Math.cos(this.lat0),this.en);}},C1:.16666666666666666666,C2:.00833333333333333333,C3:.04166666666666666666,C4:.33333333333333333333,C5:.06666666666666666666,forward:function(p){var x,y;var lam=p.x;var phi=p.y;lam=Proj4js.common.adjust_lon(lam-this.long0);if(this.sphere){x=Math.asin(Math.cos(phi)*Math.sin(lam));y=Math.atan2(Math.tan(phi),Math.cos(lam))-this.phi0;}else{this.n=Math.sin(phi);this.c=Math.cos(phi);y=this.pj_mlfn(phi,this.n,this.c,this.en);this.n=1./Math.sqrt(1.-this.es*this.n*this.n);this.tn=Math.tan(phi);this.t=this.tn*this.tn;this.a1=lam*this.c;this.c*=this.es*this.c/(1-this.es);this.a2=this.a1*this.a1;x=this.n*this.a1*(1.-this.a2*this.t*(this.C1-(8.-this.t+8.*this.c)*this.a2*this.C2));y-=this.m0-this.n*this.tn*this.a2*(.5+(5.-this.t+6.*this.c)*this.a2*this.C3);}
p.x=this.a*x+this.x0;p.y=this.a*y+this.y0;return p;},inverse:function(p){p.x-=this.x0;p.y-=this.y0;var x=p.x/this.a;var y=p.y/this.a;if(this.sphere){this.dd=y+this.lat0;phi=Math.asin(Math.sin(this.dd)*Math.cos(x));lam=Math.atan2(Math.tan(x),Math.cos(this.dd));}else{ph1=this.pj_inv_mlfn(this.m0+y,this.es,this.en);this.tn=Math.tan(ph1);this.t=this.tn*this.tn;this.n=Math.sin(ph1);this.r=1./(1.-this.es*this.n*this.n);this.n=Math.sqrt(this.r);this.r*=(1.-this.es)*this.n;this.dd=x/this.n;this.d2=this.dd*this.dd;phi=ph1-(this.n*this.tn/this.r)*this.d2*(.5-(1.+3.*this.t)*this.d2*this.C3);lam=this.dd*(1.+this.t*this.d2*(-this.C4+(1.+3.*this.t)*this.d2*this.C5))/Math.cos(ph1);}
p.x=Proj4js.common.adjust_lon(this.long0+lam);p.y=phi;return p;},pj_enfn:function(es){en=new Array();en[0]=this.C00-es*(this.C02+es*(this.C04+es*(this.C06+es*this.C08)));en[1]=es*(this.C22-es*(this.C04+es*(this.C06+es*this.C08)));var t=es*es;en[2]=t*(this.C44-es*(this.C46+es*this.C48));t*=es;en[3]=t*(this.C66-es*this.C68);en[4]=t*es*this.C88;return en;},pj_mlfn:function(phi,sphi,cphi,en){cphi*=sphi;sphi*=sphi;return(en[0]*phi-cphi*(en[1]+sphi*(en[2]+sphi*(en[3]+sphi*en[4]))));},pj_inv_mlfn:function(arg,es,en){k=1./(1.-es);phi=arg;for(i=Proj4js.common.MAX_ITER;i;--i){s=Math.sin(phi);t=1.-es*s*s;t=(this.pj_mlfn(phi,s,Math.cos(phi),en)-arg)*(t*Math.sqrt(t))*k;phi-=t;if(Math.abs(t)<Proj4js.common.EPSLN)
return phi;}
Proj4js.reportError("cass:pj_inv_mlfn: Convergence error");return phi;},C00:1.0,C02:.25,C04:.046875,C06:.01953125,C08:.01068115234375,C22:.75,C44:.46875,C46:.01302083333333333333,C48:.00712076822916666666,C66:.36458333333333333333,C68:.00569661458333333333,C88:.3076171875}
Proj4js.Proj.gauss={init:function(){sphi=Math.sin(this.lat0);cphi=Math.cos(this.lat0);cphi*=cphi;this.rc=Math.sqrt(1.0-this.es)/(1.0-this.es*sphi*sphi);this.C=Math.sqrt(1.0+this.es*cphi*cphi/(1.0-this.es));this.phic0=Math.asin(sphi/this.C);this.ratexp=0.5*this.C*this.e;this.K=Math.tan(0.5*this.phic0+Proj4js.common.FORTPI)/(Math.pow(Math.tan(0.5*this.lat0+Proj4js.common.FORTPI),this.C)*Proj4js.common.srat(this.e*sphi,this.ratexp));},forward:function(p){var lon=p.x;var lat=p.y;p.y=2.0*Math.atan(this.K*Math.pow(Math.tan(0.5*lat+Proj4js.common.FORTPI),this.C)*Proj4js.common.srat(this.e*Math.sin(lat),this.ratexp))-Proj4js.common.HALF_PI;p.x=this.C*lon;return p;},inverse:function(p){var DEL_TOL=1e-14;var lon=p.x/this.C;var lat=p.y;num=Math.pow(Math.tan(0.5*lat+Proj4js.common.FORTPI)/this.K,1./this.C);for(var i=Proj4js.common.MAX_ITER;i>0;--i){lat=2.0*Math.atan(num*Proj4js.common.srat(this.e*Math.sin(p.y),-0.5*this.e))-Proj4js.common.HALF_PI;if(Math.abs(lat-p.y)<DEL_TOL)break;p.y=lat;}
if(!i){Proj4js.reportError("gauss:inverse:convergence failed");return null;}
p.x=lon;p.y=lat;return p;}};Proj4js.Proj.omerc={init:function(){if(!this.mode)this.mode=0;if(!this.lon1){this.lon1=0;this.mode=1;}
if(!this.lon2)this.lon2=0;if(!this.lat2)this.lat2=0;var temp=this.b/this.a;var es=1.0-Math.pow(temp,2);var e=Math.sqrt(es);this.sin_p20=Math.sin(this.lat0);this.cos_p20=Math.cos(this.lat0);this.con=1.0-this.es*this.sin_p20*this.sin_p20;this.com=Math.sqrt(1.0-es);this.bl=Math.sqrt(1.0+this.es*Math.pow(this.cos_p20,4.0)/(1.0-es));this.al=this.a*this.bl*this.k0*this.com/this.con;if(Math.abs(this.lat0)<Proj4js.common.EPSLN){this.ts=1.0;this.d=1.0;this.el=1.0;}else{this.ts=Proj4js.common.tsfnz(this.e,this.lat0,this.sin_p20);this.con=Math.sqrt(this.con);this.d=this.bl*this.com/(this.cos_p20*this.con);if((this.d*this.d-1.0)>0.0){if(this.lat0>=0.0){this.f=this.d+Math.sqrt(this.d*this.d-1.0);}else{this.f=this.d-Math.sqrt(this.d*this.d-1.0);}}else{this.f=this.d;}
this.el=this.f*Math.pow(this.ts,this.bl);}
if(this.mode!=0){this.g=.5*(this.f-1.0/this.f);this.gama=Proj4js.common.asinz(Math.sin(this.alpha)/this.d);this.longc=this.longc-Proj4js.common.asinz(this.g*Math.tan(this.gama))/this.bl;this.con=Math.abs(this.lat0);if((this.con>Proj4js.common.EPSLN)&&(Math.abs(this.con-Proj4js.common.HALF_PI)>Proj4js.common.EPSLN)){this.singam=Math.sin(this.gama);this.cosgam=Math.cos(this.gama);this.sinaz=Math.sin(this.alpha);this.cosaz=Math.cos(this.alpha);if(this.lat0>=0){this.u=(this.al/this.bl)*Math.atan(Math.sqrt(this.d*this.d-1.0)/this.cosaz);}else{this.u=-(this.al/this.bl)*Math.atan(Math.sqrt(this.d*this.d-1.0)/this.cosaz);}}else{Proj4js.reportError("omerc:Init:DataError");}}else{this.sinphi=Math.sin(this.at1);this.ts1=Proj4js.common.tsfnz(this.e,this.lat1,this.sinphi);this.sinphi=Math.sin(this.lat2);this.ts2=Proj4js.common.tsfnz(this.e,this.lat2,this.sinphi);this.h=Math.pow(this.ts1,this.bl);this.l=Math.pow(this.ts2,this.bl);this.f=this.el/this.h;this.g=.5*(this.f-1.0/this.f);this.j=(this.el*this.el-this.l*this.h)/(this.el*this.el+this.l*this.h);this.p=(this.l-this.h)/(this.l+this.h);this.dlon=this.lon1-this.lon2;if(this.dlon<-Proj4js.common.PI)this.lon2=this.lon2-2.0*Proj4js.common.PI;if(this.dlon>Proj4js.common.PI)this.lon2=this.lon2+2.0*Proj4js.common.PI;this.dlon=this.lon1-this.lon2;this.longc=.5*(this.lon1+this.lon2)-Math.atan(this.j*Math.tan(.5*this.bl*this.dlon)/this.p)/this.bl;this.dlon=Proj4js.common.adjust_lon(this.lon1-this.longc);this.gama=Math.atan(Math.sin(this.bl*this.dlon)/this.g);this.alpha=Proj4js.common.asinz(this.d*Math.sin(this.gama));if(Math.abs(this.lat1-this.lat2)<=Proj4js.common.EPSLN){Proj4js.reportError("omercInitDataError");}else{this.con=Math.abs(this.lat1);}
if((this.con<=Proj4js.common.EPSLN)||(Math.abs(this.con-HALF_PI)<=Proj4js.common.EPSLN)){Proj4js.reportError("omercInitDataError");}else{if(Math.abs(Math.abs(this.lat0)-Proj4js.common.HALF_PI)<=Proj4js.common.EPSLN){Proj4js.reportError("omercInitDataError");}}
this.singam=Math.sin(this.gam);this.cosgam=Math.cos(this.gam);this.sinaz=Math.sin(this.alpha);this.cosaz=Math.cos(this.alpha);if(this.lat0>=0){this.u=(this.al/this.bl)*Math.atan(Math.sqrt(this.d*this.d-1.0)/this.cosaz);}else{this.u=-(this.al/this.bl)*Math.atan(Math.sqrt(this.d*this.d-1.0)/this.cosaz);}}},forward:function(p){var theta;var sin_phi,cos_phi;var b;var c,t,tq;var con,n,ml;var q,us,vl;var ul,vs;var s;var dlon;var ts1;var lon=p.x;var lat=p.y;sin_phi=Math.sin(lat);dlon=Proj4js.common.adjust_lon(lon-this.longc);vl=Math.sin(this.bl*dlon);if(Math.abs(Math.abs(lat)-Proj4js.common.HALF_PI)>Proj4js.common.EPSLN){ts1=Proj4js.common.tsfnz(this.e,lat,sin_phi);q=this.el/(Math.pow(ts1,this.bl));s=.5*(q-1.0/q);t=.5*(q+1.0/q);ul=(s*this.singam-vl*this.cosgam)/t;con=Math.cos(this.bl*dlon);if(Math.abs(con)<.0000001){us=this.al*this.bl*dlon;}else{us=this.al*Math.atan((s*this.cosgam+vl*this.singam)/con)/this.bl;if(con<0)us=us+Proj4js.common.PI*this.al/this.bl;}}else{if(lat>=0){ul=this.singam;}else{ul=-this.singam;}
us=this.al*lat/this.bl;}
if(Math.abs(Math.abs(ul)-1.0)<=Proj4js.common.EPSLN){Proj4js.reportError("omercFwdInfinity");}
vs=.5*this.al*Math.log((1.0-ul)/(1.0+ul))/this.bl;us=us-this.u;var x=this.x0+vs*this.cosaz+us*this.sinaz;var y=this.y0+us*this.cosaz-vs*this.sinaz;p.x=x;p.y=y;return p;},inverse:function(p){var delta_lon;var theta;var delta_theta;var sin_phi,cos_phi;var b;var c,t,tq;var con,n,ml;var vs,us,q,s,ts1;var vl,ul,bs;var dlon;var flag;p.x-=this.x0;p.y-=this.y0;flag=0;vs=p.x*this.cosaz-p.y*this.sinaz;us=p.y*this.cosaz+p.x*this.sinaz;us=us+this.u;q=Math.exp(-this.bl*vs/this.al);s=.5*(q-1.0/q);t=.5*(q+1.0/q);vl=Math.sin(this.bl*us/this.al);ul=(vl*this.cosgam+s*this.singam)/t;if(Math.abs(Math.abs(ul)-1.0)<=Proj4js.common.EPSLN)
{lon=this.longc;if(ul>=0.0){lat=Proj4js.common.HALF_PI;}else{lat=-Proj4js.common.HALF_PI;}}else{con=1.0/this.bl;ts1=Math.pow((this.el/Math.sqrt((1.0+ul)/(1.0-ul))),con);lat=Proj4js.common.phi2z(this.e,ts1);theta=this.longc-Math.atan2((s*this.cosgam-vl*this.singam),con)/this.bl;lon=Proj4js.common.adjust_lon(theta);}
p.x=lon;p.y=lat;return p;}};Proj4js.Proj.lcc={init:function(){if(!this.lat2){this.lat2=this.lat0;}
if(!this.k0)this.k0=1.0;if(Math.abs(this.lat1+this.lat2)<Proj4js.common.EPSLN){Proj4js.reportError("lcc:init: Equal Latitudes");return;}
var temp=this.b/this.a;this.e=Math.sqrt(1.0-temp*temp);var sin1=Math.sin(this.lat1);var cos1=Math.cos(this.lat1);var ms1=Proj4js.common.msfnz(this.e,sin1,cos1);var ts1=Proj4js.common.tsfnz(this.e,this.lat1,sin1);var sin2=Math.sin(this.lat2);var cos2=Math.cos(this.lat2);var ms2=Proj4js.common.msfnz(this.e,sin2,cos2);var ts2=Proj4js.common.tsfnz(this.e,this.lat2,sin2);var ts0=Proj4js.common.tsfnz(this.e,this.lat0,Math.sin(this.lat0));if(Math.abs(this.lat1-this.lat2)>Proj4js.common.EPSLN){this.ns=Math.log(ms1/ms2)/Math.log(ts1/ts2);}else{this.ns=sin1;}
this.f0=ms1/(this.ns*Math.pow(ts1,this.ns));this.rh=this.a*this.f0*Math.pow(ts0,this.ns);if(!this.title)this.title="Lambert Conformal Conic";},forward:function(p){var lon=p.x;var lat=p.y;if(lat<=90.0&&lat>=-90.0&&lon<=180.0&&lon>=-180.0){}else{Proj4js.reportError("lcc:forward: llInputOutOfRange: "+lon+" : "+lat);return null;}
var con=Math.abs(Math.abs(lat)-Proj4js.common.HALF_PI);var ts,rh1;if(con>Proj4js.common.EPSLN){ts=Proj4js.common.tsfnz(this.e,lat,Math.sin(lat));rh1=this.a*this.f0*Math.pow(ts,this.ns);}else{con=lat*this.ns;if(con<=0){Proj4js.reportError("lcc:forward: No Projection");return null;}
rh1=0;}
var theta=this.ns*Proj4js.common.adjust_lon(lon-this.long0);p.x=this.k0*(rh1*Math.sin(theta))+this.x0;p.y=this.k0*(this.rh-rh1*Math.cos(theta))+this.y0;return p;},inverse:function(p){var rh1,con,ts;var lat,lon;x=(p.x-this.x0)/this.k0;y=(this.rh-(p.y-this.y0)/this.k0);if(this.ns>0){rh1=Math.sqrt(x*x+y*y);con=1.0;}else{rh1=-Math.sqrt(x*x+y*y);con=-1.0;}
var theta=0.0;if(rh1!=0){theta=Math.atan2((con*x),(con*y));}
if((rh1!=0)||(this.ns>0.0)){con=1.0/this.ns;ts=Math.pow((rh1/(this.a*this.f0)),con);lat=Proj4js.common.phi2z(this.e,ts);if(lat==-9999)return null;}else{lat=-Proj4js.common.HALF_PI;}
lon=Proj4js.common.adjust_lon(theta/this.ns+this.long0);p.x=lon;p.y=lat;return p;}};Proj4js.Proj.laea={S_POLE:1,N_POLE:2,EQUIT:3,OBLIQ:4,init:function(){var t=Math.abs(this.lat0);if(Math.abs(t-Proj4js.common.HALF_PI)<Proj4js.common.EPSLN){this.mode=this.lat0<0.?this.S_POLE:this.N_POLE;}else if(Math.abs(t)<Proj4js.common.EPSLN){this.mode=this.EQUIT;}else{this.mode=this.OBLIQ;}
if(this.es>0){var sinphi;this.qp=Proj4js.common.qsfnz(this.e,1.0);this.mmf=.5/(1.-this.es);this.apa=this.authset(this.es);switch(this.mode){case this.N_POLE:case this.S_POLE:this.dd=1.;break;case this.EQUIT:this.rq=Math.sqrt(.5*this.qp);this.dd=1./this.rq;this.xmf=1.;this.ymf=.5*this.qp;break;case this.OBLIQ:this.rq=Math.sqrt(.5*this.qp);sinphi=Math.sin(this.lat0);this.sinb1=Proj4js.common.qsfnz(this.e,sinphi)/this.qp;this.cosb1=Math.sqrt(1.-this.sinb1*this.sinb1);this.dd=Math.cos(this.lat0)/(Math.sqrt(1.-this.es*sinphi*sinphi)*this.rq*this.cosb1);this.ymf=(this.xmf=this.rq)/this.dd;this.xmf*=this.dd;break;}}else{if(this.mode==this.OBLIQ){this.sinph0=Math.sin(this.lat0);this.cosph0=Math.cos(this.lat0);}}},forward:function(p){var x,y;var lam=p.x;var phi=p.y;lam=Proj4js.common.adjust_lon(lam-this.long0);if(this.sphere){var coslam,cosphi,sinphi;sinphi=Math.sin(phi);cosphi=Math.cos(phi);coslam=Math.cos(lam);switch(this.mode){case this.EQUIT:y=(this.mode==this.EQUIT)?1.+cosphi*coslam:1.+this.sinph0*sinphi+this.cosph0*cosphi*coslam;if(y<=Proj4js.common.EPSLN){Proj4js.reportError("laea:fwd:y less than eps");return null;}
y=Math.sqrt(2./y);x=y*cosphi*Math.sin(lam);y*=(this.mode==this.EQUIT)?sinphi:this.cosph0*sinphi-this.sinph0*cosphi*coslam;break;case this.N_POLE:coslam=-coslam;case this.S_POLE:if(Math.abs(phi+this.phi0)<Proj4js.common.EPSLN){Proj4js.reportError("laea:fwd:phi < eps");return null;}
y=Proj4js.common.FORTPI-phi*.5;y=2.*((this.mode==this.S_POLE)?Math.cos(y):Math.sin(y));x=y*Math.sin(lam);y*=coslam;break;}}else{var coslam,sinlam,sinphi,q,sinb=0.0,cosb=0.0,b=0.0;coslam=Math.cos(lam);sinlam=Math.sin(lam);sinphi=Math.sin(phi);q=Proj4js.common.qsfnz(this.e,sinphi);if(this.mode==this.OBLIQ||this.mode==this.EQUIT){sinb=q/this.qp;cosb=Math.sqrt(1.-sinb*sinb);}
switch(this.mode){case this.OBLIQ:b=1.+this.sinb1*sinb+this.cosb1*cosb*coslam;break;case this.EQUIT:b=1.+cosb*coslam;break;case this.N_POLE:b=Proj4js.common.HALF_PI+phi;q=this.qp-q;break;case this.S_POLE:b=phi-Proj4js.common.HALF_PI;q=this.qp+q;break;}
if(Math.abs(b)<Proj4js.common.EPSLN){Proj4js.reportError("laea:fwd:b < eps");return null;}
switch(this.mode){case this.OBLIQ:case this.EQUIT:b=Math.sqrt(2./b);if(this.mode==this.OBLIQ){y=this.ymf*b*(this.cosb1*sinb-this.sinb1*cosb*coslam);}else{y=(b=Math.sqrt(2./(1.+cosb*coslam)))*sinb*this.ymf;}
x=this.xmf*b*cosb*sinlam;break;case this.N_POLE:case this.S_POLE:if(q>=0.){x=(b=Math.sqrt(q))*sinlam;y=coslam*((this.mode==this.S_POLE)?b:-b);}else{x=y=0.;}
break;}}
p.x=this.a*x+this.x0;p.y=this.a*y+this.y0;return p;},inverse:function(p){p.x-=this.x0;p.y-=this.y0;var x=p.x/this.a;var y=p.y/this.a;if(this.sphere){var cosz=0.0,rh,sinz=0.0;rh=Math.sqrt(x*x+y*y);var phi=rh*.5;if(phi>1.){Proj4js.reportError("laea:Inv:DataError");return null;}
phi=2.*Math.asin(phi);if(this.mode==this.OBLIQ||this.mode==this.EQUIT){sinz=Math.sin(phi);cosz=Math.cos(phi);}
switch(this.mode){case this.EQUIT:phi=(Math.abs(rh)<=Proj4js.common.EPSLN)?0.:Math.asin(y*sinz/rh);x*=sinz;y=cosz*rh;break;case this.OBLIQ:phi=(Math.abs(rh)<=Proj4js.common.EPSLN)?this.phi0:Math.asin(cosz*sinph0+y*sinz*cosph0/rh);x*=sinz*cosph0;y=(cosz-Math.sin(phi)*sinph0)*rh;break;case this.N_POLE:y=-y;phi=Proj4js.common.HALF_PI-phi;break;case this.S_POLE:phi-=Proj4js.common.HALF_PI;break;}
lam=(y==0.&&(this.mode==this.EQUIT||this.mode==this.OBLIQ))?0.:Math.atan2(x,y);}else{var cCe,sCe,q,rho,ab=0.0;switch(this.mode){case this.EQUIT:case this.OBLIQ:x/=this.dd;y*=this.dd;rho=Math.sqrt(x*x+y*y);if(rho<Proj4js.common.EPSLN){p.x=0.;p.y=this.phi0;return p;}
sCe=2.*Math.asin(.5*rho/this.rq);cCe=Math.cos(sCe);x*=(sCe=Math.sin(sCe));if(this.mode==this.OBLIQ){ab=cCe*this.sinb1+y*sCe*this.cosb1/rho
q=this.qp*ab;y=rho*this.cosb1*cCe-y*this.sinb1*sCe;}else{ab=y*sCe/rho;q=this.qp*ab;y=rho*cCe;}
break;case this.N_POLE:y=-y;case this.S_POLE:q=(x*x+y*y);if(!q){p.x=0.;p.y=this.phi0;return p;}
ab=1.-q/this.qp;if(this.mode==this.S_POLE){ab=-ab;}
break;}
lam=Math.atan2(x,y);phi=this.authlat(Math.asin(ab),this.apa);}
p.x=Proj4js.common.adjust_lon(this.long0+lam);p.y=phi;return p;},P00:.33333333333333333333,P01:.17222222222222222222,P02:.10257936507936507936,P10:.06388888888888888888,P11:.06640211640211640211,P20:.01641501294219154443,authset:function(es){var t;var APA=new Array();APA[0]=es*this.P00;t=es*es;APA[0]+=t*this.P01;APA[1]=t*this.P10;t*=es;APA[0]+=t*this.P02;APA[1]+=t*this.P11;APA[2]=t*this.P20;return APA;},authlat:function(beta,APA){var t=beta+beta;return(beta+APA[0]*Math.sin(t)+APA[1]*Math.sin(t+t)+APA[2]*Math.sin(t+t+t));}};Proj4js.Proj.aeqd={init:function(){this.sin_p12=Math.sin(this.lat0);this.cos_p12=Math.cos(this.lat0);},forward:function(p){var lon=p.x;var lat=p.y;var ksp;var sinphi=Math.sin(p.y);var cosphi=Math.cos(p.y);var dlon=Proj4js.common.adjust_lon(lon-this.long0);var coslon=Math.cos(dlon);var g=this.sin_p12*sinphi+this.cos_p12*cosphi*coslon;if(Math.abs(Math.abs(g)-1.0)<Proj4js.common.EPSLN){ksp=1.0;if(g<0.0){Proj4js.reportError("aeqd:Fwd:PointError");return;}}else{var z=Math.acos(g);ksp=z/Math.sin(z);}
p.x=this.x0+this.a*ksp*cosphi*Math.sin(dlon);p.y=this.y0+this.a*ksp*(this.cos_p12*sinphi-this.sin_p12*cosphi*coslon);return p;},inverse:function(p){p.x-=this.x0;p.y-=this.y0;var rh=Math.sqrt(p.x*p.x+p.y*p.y);if(rh>(2.0*Proj4js.common.HALF_PI*this.a)){Proj4js.reportError("aeqdInvDataError");return;}
var z=rh/this.a;var sinz=Math.sin(z);var cosz=Math.cos(z);var lon=this.long0;var lat;if(Math.abs(rh)<=Proj4js.common.EPSLN){lat=this.lat0;}else{lat=Proj4js.common.asinz(cosz*this.sin_p12+(p.y*sinz*this.cos_p12)/rh);var con=Math.abs(this.lat0)-Proj4js.common.HALF_PI;if(Math.abs(con)<=Proj4js.common.EPSLN){if(lat0>=0.0){lon=Proj4js.common.adjust_lon(this.long0+Math.atan2(p.x,-p.y));}else{lon=Proj4js.common.adjust_lon(this.long0-Math.atan2(-p.x,p.y));}}else{con=cosz-this.sin_p12*Math.sin(lat);if((Math.abs(con)<Proj4js.common.EPSLN)&&(Math.abs(p.x)<Proj4js.common.EPSLN)){}else{var temp=Math.atan2((p.x*sinz*this.cos_p12),(con*rh));lon=Proj4js.common.adjust_lon(this.long0+Math.atan2((p.x*sinz*this.cos_p12),(con*rh)));}}}
p.x=lon;p.y=lat;return p;}};Proj4js.Proj.moll={init:function(){},forward:function(p){var lon=p.x;var lat=p.y;var delta_lon=Proj4js.common.adjust_lon(lon-this.long0);var theta=lat;var con=Proj4js.common.PI*Math.sin(lat);for(var i=0;true;i++){var delta_theta=-(theta+Math.sin(theta)-con)/(1.0+Math.cos(theta));theta+=delta_theta;if(Math.abs(delta_theta)<Proj4js.common.EPSLN)break;if(i>=50){Proj4js.reportError("moll:Fwd:IterationError");}}
theta/=2.0;if(Proj4js.common.PI/2-Math.abs(lat)<Proj4js.common.EPSLN)delta_lon=0;var x=0.900316316158*this.a*delta_lon*Math.cos(theta)+this.x0;var y=1.4142135623731*this.a*Math.sin(theta)+this.y0;p.x=x;p.y=y;return p;},inverse:function(p){var theta;var arg;p.x-=this.x0;var arg=p.y/(1.4142135623731*this.a);if(Math.abs(arg)>0.999999999999)arg=0.999999999999;var theta=Math.asin(arg);var lon=Proj4js.common.adjust_lon(this.long0+(p.x/(0.900316316158*this.a*Math.cos(theta))));if(lon<(-Proj4js.common.PI))lon=-Proj4js.common.PI;if(lon>Proj4js.common.PI)lon=Proj4js.common.PI;arg=(2.0*theta+Math.sin(2.0*theta))/Proj4js.common.PI;if(Math.abs(arg)>1.0)arg=1.0;var lat=Math.asin(arg);p.x=lon;p.y=lat;return p;}};
!function(a,b){"object"==typeof exports&&"undefined"!=typeof module?module.exports=b():"function"==typeof define&&define.amd?define(b):a.moment=b()}(this,function(){"use strict";function a(){return Md.apply(null,arguments)}function b(a){Md=a}function c(a){return"[object Array]"===Object.prototype.toString.call(a)}function d(a){return a instanceof Date||"[object Date]"===Object.prototype.toString.call(a)}function e(a,b){var c,d=[];for(c=0;c<a.length;++c)d.push(b(a[c],c));return d}function f(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function g(a,b){for(var c in b)f(b,c)&&(a[c]=b[c]);return f(b,"toString")&&(a.toString=b.toString),f(b,"valueOf")&&(a.valueOf=b.valueOf),a}function h(a,b,c,d){return Ca(a,b,c,d,!0).utc()}function i(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1}}function j(a){return null==a._pf&&(a._pf=i()),a._pf}function k(a){if(null==a._isValid){var b=j(a);a._isValid=!(isNaN(a._d.getTime())||!(b.overflow<0)||b.empty||b.invalidMonth||b.invalidWeekday||b.nullInput||b.invalidFormat||b.userInvalidated),a._strict&&(a._isValid=a._isValid&&0===b.charsLeftOver&&0===b.unusedTokens.length&&void 0===b.bigHour)}return a._isValid}function l(a){var b=h(NaN);return null!=a?g(j(b),a):j(b).userInvalidated=!0,b}function m(a,b){var c,d,e;if("undefined"!=typeof b._isAMomentObject&&(a._isAMomentObject=b._isAMomentObject),"undefined"!=typeof b._i&&(a._i=b._i),"undefined"!=typeof b._f&&(a._f=b._f),"undefined"!=typeof b._l&&(a._l=b._l),"undefined"!=typeof b._strict&&(a._strict=b._strict),"undefined"!=typeof b._tzm&&(a._tzm=b._tzm),"undefined"!=typeof b._isUTC&&(a._isUTC=b._isUTC),"undefined"!=typeof b._offset&&(a._offset=b._offset),"undefined"!=typeof b._pf&&(a._pf=j(b)),"undefined"!=typeof b._locale&&(a._locale=b._locale),Od.length>0)for(c in Od)d=Od[c],e=b[d],"undefined"!=typeof e&&(a[d]=e);return a}function n(b){m(this,b),this._d=new Date(null!=b._d?b._d.getTime():NaN),Pd===!1&&(Pd=!0,a.updateOffset(this),Pd=!1)}function o(a){return a instanceof n||null!=a&&null!=a._isAMomentObject}function p(a){return 0>a?Math.ceil(a):Math.floor(a)}function q(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=p(b)),c}function r(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;e>d;d++)(c&&a[d]!==b[d]||!c&&q(a[d])!==q(b[d]))&&g++;return g+f}function s(){}function t(a){return a?a.toLowerCase().replace("_","-"):a}function u(a){for(var b,c,d,e,f=0;f<a.length;){for(e=t(a[f]).split("-"),b=e.length,c=t(a[f+1]),c=c?c.split("-"):null;b>0;){if(d=v(e.slice(0,b).join("-")))return d;if(c&&c.length>=b&&r(e,c,!0)>=b-1)break;b--}f++}return null}function v(a){var b=null;if(!Qd[a]&&"undefined"!=typeof module&&module&&module.exports)try{b=Nd._abbr,require("./locale/"+a),w(b)}catch(c){}return Qd[a]}function w(a,b){var c;return a&&(c="undefined"==typeof b?y(a):x(a,b),c&&(Nd=c)),Nd._abbr}function x(a,b){return null!==b?(b.abbr=a,Qd[a]=Qd[a]||new s,Qd[a].set(b),w(a),Qd[a]):(delete Qd[a],null)}function y(a){var b;if(a&&a._locale&&a._locale._abbr&&(a=a._locale._abbr),!a)return Nd;if(!c(a)){if(b=v(a))return b;a=[a]}return u(a)}function z(a,b){var c=a.toLowerCase();Rd[c]=Rd[c+"s"]=Rd[b]=a}function A(a){return"string"==typeof a?Rd[a]||Rd[a.toLowerCase()]:void 0}function B(a){var b,c,d={};for(c in a)f(a,c)&&(b=A(c),b&&(d[b]=a[c]));return d}function C(b,c){return function(d){return null!=d?(E(this,b,d),a.updateOffset(this,c),this):D(this,b)}}function D(a,b){return a._d["get"+(a._isUTC?"UTC":"")+b]()}function E(a,b,c){return a._d["set"+(a._isUTC?"UTC":"")+b](c)}function F(a,b){var c;if("object"==typeof a)for(c in a)this.set(c,a[c]);else if(a=A(a),"function"==typeof this[a])return this[a](b);return this}function G(a,b,c){var d=""+Math.abs(a),e=b-d.length,f=a>=0;return(f?c?"+":"":"-")+Math.pow(10,Math.max(0,e)).toString().substr(1)+d}function H(a,b,c,d){var e=d;"string"==typeof d&&(e=function(){return this[d]()}),a&&(Vd[a]=e),b&&(Vd[b[0]]=function(){return G(e.apply(this,arguments),b[1],b[2])}),c&&(Vd[c]=function(){return this.localeData().ordinal(e.apply(this,arguments),a)})}function I(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function J(a){var b,c,d=a.match(Sd);for(b=0,c=d.length;c>b;b++)Vd[d[b]]?d[b]=Vd[d[b]]:d[b]=I(d[b]);return function(e){var f="";for(b=0;c>b;b++)f+=d[b]instanceof Function?d[b].call(e,a):d[b];return f}}function K(a,b){return a.isValid()?(b=L(b,a.localeData()),Ud[b]=Ud[b]||J(b),Ud[b](a)):a.localeData().invalidDate()}function L(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(Td.lastIndex=0;d>=0&&Td.test(a);)a=a.replace(Td,c),Td.lastIndex=0,d-=1;return a}function M(a){return"function"==typeof a&&"[object Function]"===Object.prototype.toString.call(a)}function N(a,b,c){ie[a]=M(b)?b:function(a){return a&&c?c:b}}function O(a,b){return f(ie,a)?ie[a](b._strict,b._locale):new RegExp(P(a))}function P(a){return a.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e}).replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function Q(a,b){var c,d=b;for("string"==typeof a&&(a=[a]),"number"==typeof b&&(d=function(a,c){c[b]=q(a)}),c=0;c<a.length;c++)je[a[c]]=d}function R(a,b){Q(a,function(a,c,d,e){d._w=d._w||{},b(a,d._w,d,e)})}function S(a,b,c){null!=b&&f(je,a)&&je[a](b,c._a,c,a)}function T(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function U(a){return this._months[a.month()]}function V(a){return this._monthsShort[a.month()]}function W(a,b,c){var d,e,f;for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),d=0;12>d;d++){if(e=h([2e3,d]),c&&!this._longMonthsParse[d]&&(this._longMonthsParse[d]=new RegExp("^"+this.months(e,"").replace(".","")+"$","i"),this._shortMonthsParse[d]=new RegExp("^"+this.monthsShort(e,"").replace(".","")+"$","i")),c||this._monthsParse[d]||(f="^"+this.months(e,"")+"|^"+this.monthsShort(e,""),this._monthsParse[d]=new RegExp(f.replace(".",""),"i")),c&&"MMMM"===b&&this._longMonthsParse[d].test(a))return d;if(c&&"MMM"===b&&this._shortMonthsParse[d].test(a))return d;if(!c&&this._monthsParse[d].test(a))return d}}function X(a,b){var c;return"string"==typeof b&&(b=a.localeData().monthsParse(b),"number"!=typeof b)?a:(c=Math.min(a.date(),T(a.year(),b)),a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c),a)}function Y(b){return null!=b?(X(this,b),a.updateOffset(this,!0),this):D(this,"Month")}function Z(){return T(this.year(),this.month())}function $(a){var b,c=a._a;return c&&-2===j(a).overflow&&(b=c[le]<0||c[le]>11?le:c[me]<1||c[me]>T(c[ke],c[le])?me:c[ne]<0||c[ne]>24||24===c[ne]&&(0!==c[oe]||0!==c[pe]||0!==c[qe])?ne:c[oe]<0||c[oe]>59?oe:c[pe]<0||c[pe]>59?pe:c[qe]<0||c[qe]>999?qe:-1,j(a)._overflowDayOfYear&&(ke>b||b>me)&&(b=me),j(a).overflow=b),a}function _(b){a.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+b)}function aa(a,b){var c=!0;return g(function(){return c&&(_(a+"\n"+(new Error).stack),c=!1),b.apply(this,arguments)},b)}function ba(a,b){te[a]||(_(b),te[a]=!0)}function ca(a){var b,c,d=a._i,e=ue.exec(d);if(e){for(j(a).iso=!0,b=0,c=ve.length;c>b;b++)if(ve[b][1].exec(d)){a._f=ve[b][0];break}for(b=0,c=we.length;c>b;b++)if(we[b][1].exec(d)){a._f+=(e[6]||" ")+we[b][0];break}d.match(fe)&&(a._f+="Z"),va(a)}else a._isValid=!1}function da(b){var c=xe.exec(b._i);return null!==c?void(b._d=new Date(+c[1])):(ca(b),void(b._isValid===!1&&(delete b._isValid,a.createFromInputFallback(b))))}function ea(a,b,c,d,e,f,g){var h=new Date(a,b,c,d,e,f,g);return 1970>a&&h.setFullYear(a),h}function fa(a){var b=new Date(Date.UTC.apply(null,arguments));return 1970>a&&b.setUTCFullYear(a),b}function ga(a){return ha(a)?366:365}function ha(a){return a%4===0&&a%100!==0||a%400===0}function ia(){return ha(this.year())}function ja(a,b,c){var d,e=c-b,f=c-a.day();return f>e&&(f-=7),e-7>f&&(f+=7),d=Da(a).add(f,"d"),{week:Math.ceil(d.dayOfYear()/7),year:d.year()}}function ka(a){return ja(a,this._week.dow,this._week.doy).week}function la(){return this._week.dow}function ma(){return this._week.doy}function na(a){var b=this.localeData().week(this);return null==a?b:this.add(7*(a-b),"d")}function oa(a){var b=ja(this,1,4).week;return null==a?b:this.add(7*(a-b),"d")}function pa(a,b,c,d,e){var f,g=6+e-d,h=fa(a,0,1+g),i=h.getUTCDay();return e>i&&(i+=7),c=null!=c?1*c:e,f=1+g+7*(b-1)-i+c,{year:f>0?a:a-1,dayOfYear:f>0?f:ga(a-1)+f}}function qa(a){var b=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==a?b:this.add(a-b,"d")}function ra(a,b,c){return null!=a?a:null!=b?b:c}function sa(a){var b=new Date;return a._useUTC?[b.getUTCFullYear(),b.getUTCMonth(),b.getUTCDate()]:[b.getFullYear(),b.getMonth(),b.getDate()]}function ta(a){var b,c,d,e,f=[];if(!a._d){for(d=sa(a),a._w&&null==a._a[me]&&null==a._a[le]&&ua(a),a._dayOfYear&&(e=ra(a._a[ke],d[ke]),a._dayOfYear>ga(e)&&(j(a)._overflowDayOfYear=!0),c=fa(e,0,a._dayOfYear),a._a[le]=c.getUTCMonth(),a._a[me]=c.getUTCDate()),b=0;3>b&&null==a._a[b];++b)a._a[b]=f[b]=d[b];for(;7>b;b++)a._a[b]=f[b]=null==a._a[b]?2===b?1:0:a._a[b];24===a._a[ne]&&0===a._a[oe]&&0===a._a[pe]&&0===a._a[qe]&&(a._nextDay=!0,a._a[ne]=0),a._d=(a._useUTC?fa:ea).apply(null,f),null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()-a._tzm),a._nextDay&&(a._a[ne]=24)}}function ua(a){var b,c,d,e,f,g,h;b=a._w,null!=b.GG||null!=b.W||null!=b.E?(f=1,g=4,c=ra(b.GG,a._a[ke],ja(Da(),1,4).year),d=ra(b.W,1),e=ra(b.E,1)):(f=a._locale._week.dow,g=a._locale._week.doy,c=ra(b.gg,a._a[ke],ja(Da(),f,g).year),d=ra(b.w,1),null!=b.d?(e=b.d,f>e&&++d):e=null!=b.e?b.e+f:f),h=pa(c,d,e,g,f),a._a[ke]=h.year,a._dayOfYear=h.dayOfYear}function va(b){if(b._f===a.ISO_8601)return void ca(b);b._a=[],j(b).empty=!0;var c,d,e,f,g,h=""+b._i,i=h.length,k=0;for(e=L(b._f,b._locale).match(Sd)||[],c=0;c<e.length;c++)f=e[c],d=(h.match(O(f,b))||[])[0],d&&(g=h.substr(0,h.indexOf(d)),g.length>0&&j(b).unusedInput.push(g),h=h.slice(h.indexOf(d)+d.length),k+=d.length),Vd[f]?(d?j(b).empty=!1:j(b).unusedTokens.push(f),S(f,d,b)):b._strict&&!d&&j(b).unusedTokens.push(f);j(b).charsLeftOver=i-k,h.length>0&&j(b).unusedInput.push(h),j(b).bigHour===!0&&b._a[ne]<=12&&b._a[ne]>0&&(j(b).bigHour=void 0),b._a[ne]=wa(b._locale,b._a[ne],b._meridiem),ta(b),$(b)}function wa(a,b,c){var d;return null==c?b:null!=a.meridiemHour?a.meridiemHour(b,c):null!=a.isPM?(d=a.isPM(c),d&&12>b&&(b+=12),d||12!==b||(b=0),b):b}function xa(a){var b,c,d,e,f;if(0===a._f.length)return j(a).invalidFormat=!0,void(a._d=new Date(NaN));for(e=0;e<a._f.length;e++)f=0,b=m({},a),null!=a._useUTC&&(b._useUTC=a._useUTC),b._f=a._f[e],va(b),k(b)&&(f+=j(b).charsLeftOver,f+=10*j(b).unusedTokens.length,j(b).score=f,(null==d||d>f)&&(d=f,c=b));g(a,c||b)}function ya(a){if(!a._d){var b=B(a._i);a._a=[b.year,b.month,b.day||b.date,b.hour,b.minute,b.second,b.millisecond],ta(a)}}function za(a){var b=new n($(Aa(a)));return b._nextDay&&(b.add(1,"d"),b._nextDay=void 0),b}function Aa(a){var b=a._i,e=a._f;return a._locale=a._locale||y(a._l),null===b||void 0===e&&""===b?l({nullInput:!0}):("string"==typeof b&&(a._i=b=a._locale.preparse(b)),o(b)?new n($(b)):(c(e)?xa(a):e?va(a):d(b)?a._d=b:Ba(a),a))}function Ba(b){var f=b._i;void 0===f?b._d=new Date:d(f)?b._d=new Date(+f):"string"==typeof f?da(b):c(f)?(b._a=e(f.slice(0),function(a){return parseInt(a,10)}),ta(b)):"object"==typeof f?ya(b):"number"==typeof f?b._d=new Date(f):a.createFromInputFallback(b)}function Ca(a,b,c,d,e){var f={};return"boolean"==typeof c&&(d=c,c=void 0),f._isAMomentObject=!0,f._useUTC=f._isUTC=e,f._l=c,f._i=a,f._f=b,f._strict=d,za(f)}function Da(a,b,c,d){return Ca(a,b,c,d,!1)}function Ea(a,b){var d,e;if(1===b.length&&c(b[0])&&(b=b[0]),!b.length)return Da();for(d=b[0],e=1;e<b.length;++e)(!b[e].isValid()||b[e][a](d))&&(d=b[e]);return d}function Fa(){var a=[].slice.call(arguments,0);return Ea("isBefore",a)}function Ga(){var a=[].slice.call(arguments,0);return Ea("isAfter",a)}function Ha(a){var b=B(a),c=b.year||0,d=b.quarter||0,e=b.month||0,f=b.week||0,g=b.day||0,h=b.hour||0,i=b.minute||0,j=b.second||0,k=b.millisecond||0;this._milliseconds=+k+1e3*j+6e4*i+36e5*h,this._days=+g+7*f,this._months=+e+3*d+12*c,this._data={},this._locale=y(),this._bubble()}function Ia(a){return a instanceof Ha}function Ja(a,b){H(a,0,0,function(){var a=this.utcOffset(),c="+";return 0>a&&(a=-a,c="-"),c+G(~~(a/60),2)+b+G(~~a%60,2)})}function Ka(a){var b=(a||"").match(fe)||[],c=b[b.length-1]||[],d=(c+"").match(Ce)||["-",0,0],e=+(60*d[1])+q(d[2]);return"+"===d[0]?e:-e}function La(b,c){var e,f;return c._isUTC?(e=c.clone(),f=(o(b)||d(b)?+b:+Da(b))-+e,e._d.setTime(+e._d+f),a.updateOffset(e,!1),e):Da(b).local()}function Ma(a){return 15*-Math.round(a._d.getTimezoneOffset()/15)}function Na(b,c){var d,e=this._offset||0;return null!=b?("string"==typeof b&&(b=Ka(b)),Math.abs(b)<16&&(b=60*b),!this._isUTC&&c&&(d=Ma(this)),this._offset=b,this._isUTC=!0,null!=d&&this.add(d,"m"),e!==b&&(!c||this._changeInProgress?bb(this,Ya(b-e,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,a.updateOffset(this,!0),this._changeInProgress=null)),this):this._isUTC?e:Ma(this)}function Oa(a,b){return null!=a?("string"!=typeof a&&(a=-a),this.utcOffset(a,b),this):-this.utcOffset()}function Pa(a){return this.utcOffset(0,a)}function Qa(a){return this._isUTC&&(this.utcOffset(0,a),this._isUTC=!1,a&&this.subtract(Ma(this),"m")),this}function Ra(){return this._tzm?this.utcOffset(this._tzm):"string"==typeof this._i&&this.utcOffset(Ka(this._i)),this}function Sa(a){return a=a?Da(a).utcOffset():0,(this.utcOffset()-a)%60===0}function Ta(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function Ua(){if("undefined"!=typeof this._isDSTShifted)return this._isDSTShifted;var a={};if(m(a,this),a=Aa(a),a._a){var b=a._isUTC?h(a._a):Da(a._a);this._isDSTShifted=this.isValid()&&r(a._a,b.toArray())>0}else this._isDSTShifted=!1;return this._isDSTShifted}function Va(){return!this._isUTC}function Wa(){return this._isUTC}function Xa(){return this._isUTC&&0===this._offset}function Ya(a,b){var c,d,e,g=a,h=null;return Ia(a)?g={ms:a._milliseconds,d:a._days,M:a._months}:"number"==typeof a?(g={},b?g[b]=a:g.milliseconds=a):(h=De.exec(a))?(c="-"===h[1]?-1:1,g={y:0,d:q(h[me])*c,h:q(h[ne])*c,m:q(h[oe])*c,s:q(h[pe])*c,ms:q(h[qe])*c}):(h=Ee.exec(a))?(c="-"===h[1]?-1:1,g={y:Za(h[2],c),M:Za(h[3],c),d:Za(h[4],c),h:Za(h[5],c),m:Za(h[6],c),s:Za(h[7],c),w:Za(h[8],c)}):null==g?g={}:"object"==typeof g&&("from"in g||"to"in g)&&(e=_a(Da(g.from),Da(g.to)),g={},g.ms=e.milliseconds,g.M=e.months),d=new Ha(g),Ia(a)&&f(a,"_locale")&&(d._locale=a._locale),d}function Za(a,b){var c=a&&parseFloat(a.replace(",","."));return(isNaN(c)?0:c)*b}function $a(a,b){var c={milliseconds:0,months:0};return c.months=b.month()-a.month()+12*(b.year()-a.year()),a.clone().add(c.months,"M").isAfter(b)&&--c.months,c.milliseconds=+b-+a.clone().add(c.months,"M"),c}function _a(a,b){var c;return b=La(b,a),a.isBefore(b)?c=$a(a,b):(c=$a(b,a),c.milliseconds=-c.milliseconds,c.months=-c.months),c}function ab(a,b){return function(c,d){var e,f;return null===d||isNaN(+d)||(ba(b,"moment()."+b+"(period, number) is deprecated. Please use moment()."+b+"(number, period)."),f=c,c=d,d=f),c="string"==typeof c?+c:c,e=Ya(c,d),bb(this,e,a),this}}function bb(b,c,d,e){var f=c._milliseconds,g=c._days,h=c._months;e=null==e?!0:e,f&&b._d.setTime(+b._d+f*d),g&&E(b,"Date",D(b,"Date")+g*d),h&&X(b,D(b,"Month")+h*d),e&&a.updateOffset(b,g||h)}function cb(a,b){var c=a||Da(),d=La(c,this).startOf("day"),e=this.diff(d,"days",!0),f=-6>e?"sameElse":-1>e?"lastWeek":0>e?"lastDay":1>e?"sameDay":2>e?"nextDay":7>e?"nextWeek":"sameElse";return this.format(b&&b[f]||this.localeData().calendar(f,this,Da(c)))}function db(){return new n(this)}function eb(a,b){var c;return b=A("undefined"!=typeof b?b:"millisecond"),"millisecond"===b?(a=o(a)?a:Da(a),+this>+a):(c=o(a)?+a:+Da(a),c<+this.clone().startOf(b))}function fb(a,b){var c;return b=A("undefined"!=typeof b?b:"millisecond"),"millisecond"===b?(a=o(a)?a:Da(a),+a>+this):(c=o(a)?+a:+Da(a),+this.clone().endOf(b)<c)}function gb(a,b,c){return this.isAfter(a,c)&&this.isBefore(b,c)}function hb(a,b){var c;return b=A(b||"millisecond"),"millisecond"===b?(a=o(a)?a:Da(a),+this===+a):(c=+Da(a),+this.clone().startOf(b)<=c&&c<=+this.clone().endOf(b))}function ib(a,b,c){var d,e,f=La(a,this),g=6e4*(f.utcOffset()-this.utcOffset());return b=A(b),"year"===b||"month"===b||"quarter"===b?(e=jb(this,f),"quarter"===b?e/=3:"year"===b&&(e/=12)):(d=this-f,e="second"===b?d/1e3:"minute"===b?d/6e4:"hour"===b?d/36e5:"day"===b?(d-g)/864e5:"week"===b?(d-g)/6048e5:d),c?e:p(e)}function jb(a,b){var c,d,e=12*(b.year()-a.year())+(b.month()-a.month()),f=a.clone().add(e,"months");return 0>b-f?(c=a.clone().add(e-1,"months"),d=(b-f)/(f-c)):(c=a.clone().add(e+1,"months"),d=(b-f)/(c-f)),-(e+d)}function kb(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function lb(){var a=this.clone().utc();return 0<a.year()&&a.year()<=9999?"function"==typeof Date.prototype.toISOString?this.toDate().toISOString():K(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):K(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")}function mb(b){var c=K(this,b||a.defaultFormat);return this.localeData().postformat(c)}function nb(a,b){return this.isValid()?Ya({to:this,from:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function ob(a){return this.from(Da(),a)}function pb(a,b){return this.isValid()?Ya({from:this,to:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function qb(a){return this.to(Da(),a)}function rb(a){var b;return void 0===a?this._locale._abbr:(b=y(a),null!=b&&(this._locale=b),this)}function sb(){return this._locale}function tb(a){switch(a=A(a)){case"year":this.month(0);case"quarter":case"month":this.date(1);case"week":case"isoWeek":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===a&&this.weekday(0),"isoWeek"===a&&this.isoWeekday(1),"quarter"===a&&this.month(3*Math.floor(this.month()/3)),this}function ub(a){return a=A(a),void 0===a||"millisecond"===a?this:this.startOf(a).add(1,"isoWeek"===a?"week":a).subtract(1,"ms")}function vb(){return+this._d-6e4*(this._offset||0)}function wb(){return Math.floor(+this/1e3)}function xb(){return this._offset?new Date(+this):this._d}function yb(){var a=this;return[a.year(),a.month(),a.date(),a.hour(),a.minute(),a.second(),a.millisecond()]}function zb(){var a=this;return{years:a.year(),months:a.month(),date:a.date(),hours:a.hours(),minutes:a.minutes(),seconds:a.seconds(),milliseconds:a.milliseconds()}}function Ab(){return k(this)}function Bb(){return g({},j(this))}function Cb(){return j(this).overflow}function Db(a,b){H(0,[a,a.length],0,b)}function Eb(a,b,c){return ja(Da([a,11,31+b-c]),b,c).week}function Fb(a){var b=ja(this,this.localeData()._week.dow,this.localeData()._week.doy).year;return null==a?b:this.add(a-b,"y")}function Gb(a){var b=ja(this,1,4).year;return null==a?b:this.add(a-b,"y")}function Hb(){return Eb(this.year(),1,4)}function Ib(){var a=this.localeData()._week;return Eb(this.year(),a.dow,a.doy)}function Jb(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)}function Kb(a,b){return"string"!=typeof a?a:isNaN(a)?(a=b.weekdaysParse(a),"number"==typeof a?a:null):parseInt(a,10)}function Lb(a){return this._weekdays[a.day()]}function Mb(a){return this._weekdaysShort[a.day()]}function Nb(a){return this._weekdaysMin[a.day()]}function Ob(a){var b,c,d;for(this._weekdaysParse=this._weekdaysParse||[],b=0;7>b;b++)if(this._weekdaysParse[b]||(c=Da([2e3,1]).day(b),d="^"+this.weekdays(c,"")+"|^"+this.weekdaysShort(c,"")+"|^"+this.weekdaysMin(c,""),this._weekdaysParse[b]=new RegExp(d.replace(".",""),"i")),this._weekdaysParse[b].test(a))return b}function Pb(a){var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=Kb(a,this.localeData()),this.add(a-b,"d")):b}function Qb(a){var b=(this.day()+7-this.localeData()._week.dow)%7;return null==a?b:this.add(a-b,"d")}function Rb(a){return null==a?this.day()||7:this.day(this.day()%7?a:a-7)}function Sb(a,b){H(a,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),b)})}function Tb(a,b){return b._meridiemParse}function Ub(a){return"p"===(a+"").toLowerCase().charAt(0)}function Vb(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"}function Wb(a,b){b[qe]=q(1e3*("0."+a))}function Xb(){return this._isUTC?"UTC":""}function Yb(){return this._isUTC?"Coordinated Universal Time":""}function Zb(a){return Da(1e3*a)}function $b(){return Da.apply(null,arguments).parseZone()}function _b(a,b,c){var d=this._calendar[a];return"function"==typeof d?d.call(b,c):d}function ac(a){var b=this._longDateFormat[a],c=this._longDateFormat[a.toUpperCase()];return b||!c?b:(this._longDateFormat[a]=c.replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a])}function bc(){return this._invalidDate}function cc(a){return this._ordinal.replace("%d",a)}function dc(a){return a}function ec(a,b,c,d){var e=this._relativeTime[c];return"function"==typeof e?e(a,b,c,d):e.replace(/%d/i,a)}function fc(a,b){var c=this._relativeTime[a>0?"future":"past"];return"function"==typeof c?c(b):c.replace(/%s/i,b)}function gc(a){var b,c;for(c in a)b=a[c],"function"==typeof b?this[c]=b:this["_"+c]=b;this._ordinalParseLenient=new RegExp(this._ordinalParse.source+"|"+/\d{1,2}/.source)}function hc(a,b,c,d){var e=y(),f=h().set(d,b);return e[c](f,a)}function ic(a,b,c,d,e){if("number"==typeof a&&(b=a,a=void 0),a=a||"",null!=b)return hc(a,b,c,e);var f,g=[];for(f=0;d>f;f++)g[f]=hc(a,f,c,e);return g}function jc(a,b){return ic(a,b,"months",12,"month")}function kc(a,b){return ic(a,b,"monthsShort",12,"month")}function lc(a,b){return ic(a,b,"weekdays",7,"day")}function mc(a,b){return ic(a,b,"weekdaysShort",7,"day")}function nc(a,b){return ic(a,b,"weekdaysMin",7,"day")}function oc(){var a=this._data;return this._milliseconds=_e(this._milliseconds),this._days=_e(this._days),this._months=_e(this._months),a.milliseconds=_e(a.milliseconds),a.seconds=_e(a.seconds),a.minutes=_e(a.minutes),a.hours=_e(a.hours),a.months=_e(a.months),a.years=_e(a.years),this}function pc(a,b,c,d){var e=Ya(b,c);return a._milliseconds+=d*e._milliseconds,a._days+=d*e._days,a._months+=d*e._months,a._bubble()}function qc(a,b){return pc(this,a,b,1)}function rc(a,b){return pc(this,a,b,-1)}function sc(a){return 0>a?Math.floor(a):Math.ceil(a)}function tc(){var a,b,c,d,e,f=this._milliseconds,g=this._days,h=this._months,i=this._data;return f>=0&&g>=0&&h>=0||0>=f&&0>=g&&0>=h||(f+=864e5*sc(vc(h)+g),g=0,h=0),i.milliseconds=f%1e3,a=p(f/1e3),i.seconds=a%60,b=p(a/60),i.minutes=b%60,c=p(b/60),i.hours=c%24,g+=p(c/24),e=p(uc(g)),h+=e,g-=sc(vc(e)),d=p(h/12),h%=12,i.days=g,i.months=h,i.years=d,this}function uc(a){return 4800*a/146097}function vc(a){return 146097*a/4800}function wc(a){var b,c,d=this._milliseconds;if(a=A(a),"month"===a||"year"===a)return b=this._days+d/864e5,c=this._months+uc(b),"month"===a?c:c/12;switch(b=this._days+Math.round(vc(this._months)),a){case"week":return b/7+d/6048e5;case"day":return b+d/864e5;case"hour":return 24*b+d/36e5;case"minute":return 1440*b+d/6e4;case"second":return 86400*b+d/1e3;case"millisecond":return Math.floor(864e5*b)+d;default:throw new Error("Unknown unit "+a)}}function xc(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*q(this._months/12)}function yc(a){return function(){return this.as(a)}}function zc(a){return a=A(a),this[a+"s"]()}function Ac(a){return function(){return this._data[a]}}function Bc(){return p(this.days()/7)}function Cc(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function Dc(a,b,c){var d=Ya(a).abs(),e=qf(d.as("s")),f=qf(d.as("m")),g=qf(d.as("h")),h=qf(d.as("d")),i=qf(d.as("M")),j=qf(d.as("y")),k=e<rf.s&&["s",e]||1===f&&["m"]||f<rf.m&&["mm",f]||1===g&&["h"]||g<rf.h&&["hh",g]||1===h&&["d"]||h<rf.d&&["dd",h]||1===i&&["M"]||i<rf.M&&["MM",i]||1===j&&["y"]||["yy",j];return k[2]=b,k[3]=+a>0,k[4]=c,Cc.apply(null,k)}function Ec(a,b){return void 0===rf[a]?!1:void 0===b?rf[a]:(rf[a]=b,!0)}function Fc(a){var b=this.localeData(),c=Dc(this,!a,b);return a&&(c=b.pastFuture(+this,c)),b.postformat(c)}function Gc(){var a,b,c,d=sf(this._milliseconds)/1e3,e=sf(this._days),f=sf(this._months);a=p(d/60),b=p(a/60),d%=60,a%=60,c=p(f/12),f%=12;var g=c,h=f,i=e,j=b,k=a,l=d,m=this.asSeconds();return m?(0>m?"-":"")+"P"+(g?g+"Y":"")+(h?h+"M":"")+(i?i+"D":"")+(j||k||l?"T":"")+(j?j+"H":"")+(k?k+"M":"")+(l?l+"S":""):"P0D"}
//! moment.js locale configuration
//! locale : belarusian (be)
//! author : Dmitry Demidov : https://github.com/demidov91
//! author: Praleska: http://praleska.pro/
//! Author : Menelion Elensúle : https://github.com/Oire
function Hc(a,b){var c=a.split("_");return b%10===1&&b%100!==11?c[0]:b%10>=2&&4>=b%10&&(10>b%100||b%100>=20)?c[1]:c[2]}function Ic(a,b,c){var d={mm:b?"хвіліна_хвіліны_хвілін":"хвіліну_хвіліны_хвілін",hh:b?"гадзіна_гадзіны_гадзін":"гадзіну_гадзіны_гадзін",dd:"дзень_дні_дзён",MM:"месяц_месяцы_месяцаў",yy:"год_гады_гадоў"};return"m"===c?b?"хвіліна":"хвіліну":"h"===c?b?"гадзіна":"гадзіну":a+" "+Hc(d[c],+a)}function Jc(a,b){var c={nominative:"студзень_люты_сакавік_красавік_травень_чэрвень_ліпень_жнівень_верасень_кастрычнік_лістапад_снежань".split("_"),accusative:"студзеня_лютага_сакавіка_красавіка_траўня_чэрвеня_ліпеня_жніўня_верасня_кастрычніка_лістапада_снежня".split("_")},d=/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(b)?"accusative":"nominative";return c[d][a.month()]}function Kc(a,b){var c={nominative:"нядзеля_панядзелак_аўторак_серада_чацвер_пятніца_субота".split("_"),accusative:"нядзелю_панядзелак_аўторак_сераду_чацвер_пятніцу_суботу".split("_")},d=/\[ ?[Вв] ?(?:мінулую|наступную)? ?\] ?dddd/.test(b)?"accusative":"nominative";return c[d][a.day()]}
//! moment.js locale configuration
//! locale : breton (br)
//! author : Jean-Baptiste Le Duigou : https://github.com/jbleduigou
function Lc(a,b,c){var d={mm:"munutenn",MM:"miz",dd:"devezh"};return a+" "+Oc(d[c],a)}function Mc(a){switch(Nc(a)){case 1:case 3:case 4:case 5:case 9:return a+" bloaz";default:return a+" vloaz"}}function Nc(a){return a>9?Nc(a%10):a}function Oc(a,b){return 2===b?Pc(a):a}function Pc(a){var b={m:"v",b:"v",d:"z"};return void 0===b[a.charAt(0)]?a:b[a.charAt(0)]+a.substring(1)}
//! moment.js locale configuration
//! locale : bosnian (bs)
//! author : Nedim Cholich : https://github.com/frontyard
//! based on (hr) translation by Bojan Marković
function Qc(a,b,c){var d=a+" ";switch(c){case"m":return b?"jedna minuta":"jedne minute";case"mm":return d+=1===a?"minuta":2===a||3===a||4===a?"minute":"minuta";case"h":return b?"jedan sat":"jednog sata";case"hh":return d+=1===a?"sat":2===a||3===a||4===a?"sata":"sati";case"dd":return d+=1===a?"dan":"dana";case"MM":return d+=1===a?"mjesec":2===a||3===a||4===a?"mjeseca":"mjeseci";case"yy":return d+=1===a?"godina":2===a||3===a||4===a?"godine":"godina"}}function Rc(a){return a>1&&5>a&&1!==~~(a/10)}function Sc(a,b,c,d){var e=a+" ";switch(c){case"s":return b||d?"pár sekund":"pár sekundami";case"m":return b?"minuta":d?"minutu":"minutou";case"mm":return b||d?e+(Rc(a)?"minuty":"minut"):e+"minutami";break;case"h":return b?"hodina":d?"hodinu":"hodinou";case"hh":return b||d?e+(Rc(a)?"hodiny":"hodin"):e+"hodinami";break;case"d":return b||d?"den":"dnem";case"dd":return b||d?e+(Rc(a)?"dny":"dní"):e+"dny";break;case"M":return b||d?"měsíc":"měsícem";case"MM":return b||d?e+(Rc(a)?"měsíce":"měsíců"):e+"měsíci";break;case"y":return b||d?"rok":"rokem";case"yy":return b||d?e+(Rc(a)?"roky":"let"):e+"lety"}}
//! moment.js locale configuration
//! locale : austrian german (de-at)
//! author : lluchs : https://github.com/lluchs
//! author: Menelion Elensúle: https://github.com/Oire
//! author : Martin Groller : https://github.com/MadMG
function Tc(a,b,c,d){var e={m:["eine Minute","einer Minute"],h:["eine Stunde","einer Stunde"],d:["ein Tag","einem Tag"],dd:[a+" Tage",a+" Tagen"],M:["ein Monat","einem Monat"],MM:[a+" Monate",a+" Monaten"],y:["ein Jahr","einem Jahr"],yy:[a+" Jahre",a+" Jahren"]};return b?e[c][0]:e[c][1]}
//! moment.js locale configuration
//! locale : german (de)
//! author : lluchs : https://github.com/lluchs
//! author: Menelion Elensúle: https://github.com/Oire
function Uc(a,b,c,d){var e={m:["eine Minute","einer Minute"],h:["eine Stunde","einer Stunde"],d:["ein Tag","einem Tag"],dd:[a+" Tage",a+" Tagen"],M:["ein Monat","einem Monat"],MM:[a+" Monate",a+" Monaten"],y:["ein Jahr","einem Jahr"],yy:[a+" Jahre",a+" Jahren"]};return b?e[c][0]:e[c][1]}
//! moment.js locale configuration
//! locale : estonian (et)
//! author : Henry Kehlmann : https://github.com/madhenry
//! improvements : Illimar Tambek : https://github.com/ragulka
function Vc(a,b,c,d){var e={s:["mõne sekundi","mõni sekund","paar sekundit"],m:["ühe minuti","üks minut"],mm:[a+" minuti",a+" minutit"],h:["ühe tunni","tund aega","üks tund"],hh:[a+" tunni",a+" tundi"],d:["ühe päeva","üks päev"],M:["kuu aja","kuu aega","üks kuu"],MM:[a+" kuu",a+" kuud"],y:["ühe aasta","aasta","üks aasta"],yy:[a+" aasta",a+" aastat"]};return b?e[c][2]?e[c][2]:e[c][1]:d?e[c][0]:e[c][1]}function Wc(a,b,c,d){var e="";switch(c){case"s":return d?"muutaman sekunnin":"muutama sekunti";case"m":return d?"minuutin":"minuutti";case"mm":e=d?"minuutin":"minuuttia";break;case"h":return d?"tunnin":"tunti";case"hh":e=d?"tunnin":"tuntia";break;case"d":return d?"päivän":"päivä";case"dd":e=d?"päivän":"päivää";break;case"M":return d?"kuukauden":"kuukausi";case"MM":e=d?"kuukauden":"kuukautta";break;case"y":return d?"vuoden":"vuosi";case"yy":e=d?"vuoden":"vuotta"}return e=Xc(a,d)+" "+e}function Xc(a,b){return 10>a?b?Pf[a]:Of[a]:a}
//! moment.js locale configuration
//! locale : hrvatski (hr)
//! author : Bojan Marković : https://github.com/bmarkovic
function Yc(a,b,c){var d=a+" ";switch(c){case"m":return b?"jedna minuta":"jedne minute";case"mm":return d+=1===a?"minuta":2===a||3===a||4===a?"minute":"minuta";case"h":return b?"jedan sat":"jednog sata";case"hh":return d+=1===a?"sat":2===a||3===a||4===a?"sata":"sati";case"dd":return d+=1===a?"dan":"dana";case"MM":return d+=1===a?"mjesec":2===a||3===a||4===a?"mjeseca":"mjeseci";case"yy":return d+=1===a?"godina":2===a||3===a||4===a?"godine":"godina"}}function Zc(a,b,c,d){var e=a;switch(c){case"s":return d||b?"néhány másodperc":"néhány másodperce";case"m":return"egy"+(d||b?" perc":" perce");case"mm":return e+(d||b?" perc":" perce");case"h":return"egy"+(d||b?" óra":" órája");case"hh":return e+(d||b?" óra":" órája");case"d":return"egy"+(d||b?" nap":" napja");case"dd":return e+(d||b?" nap":" napja");case"M":return"egy"+(d||b?" hónap":" hónapja");case"MM":return e+(d||b?" hónap":" hónapja");case"y":return"egy"+(d||b?" év":" éve");case"yy":return e+(d||b?" év":" éve")}return""}function $c(a){return(a?"":"[múlt] ")+"["+Uf[this.day()]+"] LT[-kor]"}
//! moment.js locale configuration
//! locale : Armenian (hy-am)
//! author : Armendarabyan : https://github.com/armendarabyan
function _c(a,b){var c={nominative:"հունվար_փետրվար_մարտ_ապրիլ_մայիս_հունիս_հուլիս_օգոստոս_սեպտեմբեր_հոկտեմբեր_նոյեմբեր_դեկտեմբեր".split("_"),accusative:"հունվարի_փետրվարի_մարտի_ապրիլի_մայիսի_հունիսի_հուլիսի_օգոստոսի_սեպտեմբերի_հոկտեմբերի_նոյեմբերի_դեկտեմբերի".split("_")},d=/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(b)?"accusative":"nominative";return c[d][a.month()]}function ad(a,b){var c="հնվ_փտր_մրտ_ապր_մյս_հնս_հլս_օգս_սպտ_հկտ_նմբ_դկտ".split("_");return c[a.month()]}function bd(a,b){var c="կիրակի_երկուշաբթի_երեքշաբթի_չորեքշաբթի_հինգշաբթի_ուրբաթ_շաբաթ".split("_");return c[a.day()]}
//! moment.js locale configuration
//! locale : icelandic (is)
//! author : Hinrik Örn Sigurðsson : https://github.com/hinrik
function cd(a){return a%100===11?!0:a%10===1?!1:!0}function dd(a,b,c,d){var e=a+" ";switch(c){case"s":return b||d?"nokkrar sekúndur":"nokkrum sekúndum";case"m":return b?"mínúta":"mínútu";case"mm":return cd(a)?e+(b||d?"mínútur":"mínútum"):b?e+"mínúta":e+"mínútu";case"hh":return cd(a)?e+(b||d?"klukkustundir":"klukkustundum"):e+"klukkustund";case"d":return b?"dagur":d?"dag":"degi";case"dd":return cd(a)?b?e+"dagar":e+(d?"daga":"dögum"):b?e+"dagur":e+(d?"dag":"degi");case"M":return b?"mánuður":d?"mánuð":"mánuði";case"MM":return cd(a)?b?e+"mánuðir":e+(d?"mánuði":"mánuðum"):b?e+"mánuður":e+(d?"mánuð":"mánuði");case"y":return b||d?"ár":"ári";case"yy":return cd(a)?e+(b||d?"ár":"árum"):e+(b||d?"ár":"ári")}}
//! moment.js locale configuration
//! locale : Georgian (ka)
//! author : Irakli Janiashvili : https://github.com/irakli-janiashvili
function ed(a,b){var c={nominative:"იანვარი_თებერვალი_მარტი_აპრილი_მაისი_ივნისი_ივლისი_აგვისტო_სექტემბერი_ოქტომბერი_ნოემბერი_დეკემბერი".split("_"),accusative:"იანვარს_თებერვალს_მარტს_აპრილის_მაისს_ივნისს_ივლისს_აგვისტს_სექტემბერს_ოქტომბერს_ნოემბერს_დეკემბერს".split("_")},d=/D[oD] *MMMM?/.test(b)?"accusative":"nominative";return c[d][a.month()]}function fd(a,b){var c={nominative:"კვირა_ორშაბათი_სამშაბათი_ოთხშაბათი_ხუთშაბათი_პარასკევი_შაბათი".split("_"),accusative:"კვირას_ორშაბათს_სამშაბათს_ოთხშაბათს_ხუთშაბათს_პარასკევს_შაბათს".split("_")},d=/(წინა|შემდეგ)/.test(b)?"accusative":"nominative";return c[d][a.day()]}
//! moment.js locale configuration
//! locale : Luxembourgish (lb)
//! author : mweimerskirch : https://github.com/mweimerskirch, David Raison : https://github.com/kwisatz
function gd(a,b,c,d){var e={m:["eng Minutt","enger Minutt"],h:["eng Stonn","enger Stonn"],d:["een Dag","engem Dag"],M:["ee Mount","engem Mount"],y:["ee Joer","engem Joer"]};return b?e[c][0]:e[c][1]}function hd(a){var b=a.substr(0,a.indexOf(" "));return jd(b)?"a "+a:"an "+a}function id(a){var b=a.substr(0,a.indexOf(" "));return jd(b)?"viru "+a:"virun "+a}function jd(a){if(a=parseInt(a,10),isNaN(a))return!1;if(0>a)return!0;if(10>a)return a>=4&&7>=a?!0:!1;if(100>a){var b=a%10,c=a/10;return jd(0===b?c:b)}if(1e4>a){for(;a>=10;)a/=10;return jd(a)}return a/=1e3,jd(a)}function kd(a,b,c,d){return b?"kelios sekundės":d?"kelių sekundžių":"kelias sekundes"}function ld(a,b){var c={nominative:"sausis_vasaris_kovas_balandis_gegužė_birželis_liepa_rugpjūtis_rugsėjis_spalis_lapkritis_gruodis".split("_"),accusative:"sausio_vasario_kovo_balandžio_gegužės_birželio_liepos_rugpjūčio_rugsėjo_spalio_lapkričio_gruodžio".split("_")},d=/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(b)?"accusative":"nominative";return c[d][a.month()]}function md(a,b,c,d){return b?od(c)[0]:d?od(c)[1]:od(c)[2]}function nd(a){return a%10===0||a>10&&20>a}function od(a){return Vf[a].split("_")}function pd(a,b,c,d){var e=a+" ";return 1===a?e+md(a,b,c[0],d):b?e+(nd(a)?od(c)[1]:od(c)[0]):d?e+od(c)[1]:e+(nd(a)?od(c)[1]:od(c)[2])}function qd(a,b){var c=-1===b.indexOf("dddd HH:mm"),d=Wf[a.day()];return c?d:d.substring(0,d.length-2)+"į"}function rd(a,b,c){return c?b%10===1&&11!==b?a[2]:a[3]:b%10===1&&11!==b?a[0]:a[1]}function sd(a,b,c){return a+" "+rd(Xf[c],a,b)}function td(a,b,c){return rd(Xf[c],a,b)}function ud(a,b){return b?"dažas sekundes":"dažām sekundēm"}function vd(a){return 5>a%10&&a%10>1&&~~(a/10)%10!==1}function wd(a,b,c){var d=a+" ";switch(c){case"m":return b?"minuta":"minutę";case"mm":return d+(vd(a)?"minuty":"minut");case"h":return b?"godzina":"godzinę";case"hh":return d+(vd(a)?"godziny":"godzin");case"MM":return d+(vd(a)?"miesiące":"miesięcy");case"yy":return d+(vd(a)?"lata":"lat")}}
//! moment.js locale configuration
//! locale : romanian (ro)
//! author : Vlad Gurdiga : https://github.com/gurdiga
//! author : Valentin Agachi : https://github.com/avaly
function xd(a,b,c){var d={mm:"minute",hh:"ore",dd:"zile",MM:"luni",yy:"ani"},e=" ";return(a%100>=20||a>=100&&a%100===0)&&(e=" de "),a+e+d[c]}
//! moment.js locale configuration
//! locale : russian (ru)
//! author : Viktorminator : https://github.com/Viktorminator
//! Author : Menelion Elensúle : https://github.com/Oire
function yd(a,b){var c=a.split("_");return b%10===1&&b%100!==11?c[0]:b%10>=2&&4>=b%10&&(10>b%100||b%100>=20)?c[1]:c[2]}function zd(a,b,c){var d={mm:b?"минута_минуты_минут":"минуту_минуты_минут",hh:"час_часа_часов",dd:"день_дня_дней",MM:"месяц_месяца_месяцев",yy:"год_года_лет"};return"m"===c?b?"минута":"минуту":a+" "+yd(d[c],+a)}function Ad(a,b){var c={nominative:"январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь".split("_"),accusative:"января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря".split("_")},d=/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(b)?"accusative":"nominative";return c[d][a.month()]}function Bd(a,b){var c={nominative:"янв_фев_март_апр_май_июнь_июль_авг_сен_окт_ноя_дек".split("_"),accusative:"янв_фев_мар_апр_мая_июня_июля_авг_сен_окт_ноя_дек".split("_")},d=/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/.test(b)?"accusative":"nominative";return c[d][a.month()]}function Cd(a,b){var c={nominative:"воскресенье_понедельник_вторник_среда_четверг_пятница_суббота".split("_"),accusative:"воскресенье_понедельник_вторник_среду_четверг_пятницу_субботу".split("_")},d=/\[ ?[Вв] ?(?:прошлую|следующую|эту)? ?\] ?dddd/.test(b)?"accusative":"nominative";return c[d][a.day()]}function Dd(a){return a>1&&5>a}function Ed(a,b,c,d){var e=a+" ";switch(c){case"s":return b||d?"pár sekúnd":"pár sekundami";case"m":return b?"minúta":d?"minútu":"minútou";case"mm":return b||d?e+(Dd(a)?"minúty":"minút"):e+"minútami";break;case"h":return b?"hodina":d?"hodinu":"hodinou";case"hh":return b||d?e+(Dd(a)?"hodiny":"hodín"):e+"hodinami";break;case"d":return b||d?"deň":"dňom";case"dd":return b||d?e+(Dd(a)?"dni":"dní"):e+"dňami";break;case"M":return b||d?"mesiac":"mesiacom";case"MM":return b||d?e+(Dd(a)?"mesiace":"mesiacov"):e+"mesiacmi";break;case"y":return b||d?"rok":"rokom";case"yy":return b||d?e+(Dd(a)?"roky":"rokov"):e+"rokmi"}}
//! moment.js locale configuration
//! locale : slovenian (sl)
//! author : Robert Sedovšek : https://github.com/sedovsek
function Fd(a,b,c,d){var e=a+" ";switch(c){case"s":return b||d?"nekaj sekund":"nekaj sekundami";case"m":return b?"ena minuta":"eno minuto";case"mm":return e+=1===a?b?"minuta":"minuto":2===a?b||d?"minuti":"minutama":5>a?b||d?"minute":"minutami":b||d?"minut":"minutami";case"h":return b?"ena ura":"eno uro";case"hh":return e+=1===a?b?"ura":"uro":2===a?b||d?"uri":"urama":5>a?b||d?"ure":"urami":b||d?"ur":"urami";case"d":return b||d?"en dan":"enim dnem";case"dd":return e+=1===a?b||d?"dan":"dnem":2===a?b||d?"dni":"dnevoma":b||d?"dni":"dnevi";case"M":return b||d?"en mesec":"enim mesecem";case"MM":return e+=1===a?b||d?"mesec":"mesecem":2===a?b||d?"meseca":"mesecema":5>a?b||d?"mesece":"meseci":b||d?"mesecev":"meseci";case"y":return b||d?"eno leto":"enim letom";case"yy":return e+=1===a?b||d?"leto":"letom":2===a?b||d?"leti":"letoma":5>a?b||d?"leta":"leti":b||d?"let":"leti"}}function Gd(a,b,c,d){var e={s:["viensas secunds","'iensas secunds"],m:["'n míut","'iens míut"],mm:[a+" míuts"," "+a+" míuts"],h:["'n þora","'iensa þora"],hh:[a+" þoras"," "+a+" þoras"],d:["'n ziua","'iensa ziua"],dd:[a+" ziuas"," "+a+" ziuas"],M:["'n mes","'iens mes"],MM:[a+" mesen"," "+a+" mesen"],y:["'n ar","'iens ar"],yy:[a+" ars"," "+a+" ars"]};return d?e[c][0]:b?e[c][0]:e[c][1].trim()}
//! moment.js locale configuration
//! locale : ukrainian (uk)
//! author : zemlanin : https://github.com/zemlanin
//! Author : Menelion Elensúle : https://github.com/Oire
function Hd(a,b){var c=a.split("_");return b%10===1&&b%100!==11?c[0]:b%10>=2&&4>=b%10&&(10>b%100||b%100>=20)?c[1]:c[2]}function Id(a,b,c){var d={mm:"хвилина_хвилини_хвилин",hh:"година_години_годин",dd:"день_дні_днів",MM:"місяць_місяці_місяців",yy:"рік_роки_років"};return"m"===c?b?"хвилина":"хвилину":"h"===c?b?"година":"годину":a+" "+Hd(d[c],+a)}function Jd(a,b){var c={nominative:"січень_лютий_березень_квітень_травень_червень_липень_серпень_вересень_жовтень_листопад_грудень".split("_"),accusative:"січня_лютого_березня_квітня_травня_червня_липня_серпня_вересня_жовтня_листопада_грудня".split("_")},d=/D[oD]? *MMMM?/.test(b)?"accusative":"nominative";return c[d][a.month()]}function Kd(a,b){var c={nominative:"неділя_понеділок_вівторок_середа_четвер_п’ятниця_субота".split("_"),accusative:"неділю_понеділок_вівторок_середу_четвер_п’ятницю_суботу".split("_"),genitive:"неділі_понеділка_вівторка_середи_четверга_п’ятниці_суботи".split("_")},d=/(\[[ВвУу]\]) ?dddd/.test(b)?"accusative":/\[?(?:минулої|наступної)? ?\] ?dddd/.test(b)?"genitive":"nominative";return c[d][a.day()]}function Ld(a){return function(){return a+"о"+(11===this.hours()?"б":"")+"] LT"}}var Md,Nd,Od=a.momentProperties=[],Pd=!1,Qd={},Rd={},Sd=/(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,Td=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,Ud={},Vd={},Wd=/\d/,Xd=/\d\d/,Yd=/\d{3}/,Zd=/\d{4}/,$d=/[+-]?\d{6}/,_d=/\d\d?/,ae=/\d{1,3}/,be=/\d{1,4}/,ce=/[+-]?\d{1,6}/,de=/\d+/,ee=/[+-]?\d+/,fe=/Z|[+-]\d\d:?\d\d/gi,ge=/[+-]?\d+(\.\d{1,3})?/,he=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,ie={},je={},ke=0,le=1,me=2,ne=3,oe=4,pe=5,qe=6;H("M",["MM",2],"Mo",function(){return this.month()+1}),H("MMM",0,0,function(a){return this.localeData().monthsShort(this,a)}),H("MMMM",0,0,function(a){return this.localeData().months(this,a)}),z("month","M"),N("M",_d),N("MM",_d,Xd),N("MMM",he),N("MMMM",he),Q(["M","MM"],function(a,b){b[le]=q(a)-1}),Q(["MMM","MMMM"],function(a,b,c,d){var e=c._locale.monthsParse(a,d,c._strict);null!=e?b[le]=e:j(c).invalidMonth=a});var re="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),se="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),te={};a.suppressDeprecationWarnings=!1;var ue=/^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,ve=[["YYYYYY-MM-DD",/[+-]\d{6}-\d{2}-\d{2}/],["YYYY-MM-DD",/\d{4}-\d{2}-\d{2}/],["GGGG-[W]WW-E",/\d{4}-W\d{2}-\d/],["GGGG-[W]WW",/\d{4}-W\d{2}/],["YYYY-DDD",/\d{4}-\d{3}/]],we=[["HH:mm:ss.SSSS",/(T| )\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss",/(T| )\d\d:\d\d:\d\d/],["HH:mm",/(T| )\d\d:\d\d/],["HH",/(T| )\d\d/]],xe=/^\/?Date\((\-?\d+)/i;a.createFromInputFallback=aa("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.",function(a){a._d=new Date(a._i+(a._useUTC?" UTC":""))}),H(0,["YY",2],0,function(){return this.year()%100}),H(0,["YYYY",4],0,"year"),H(0,["YYYYY",5],0,"year"),H(0,["YYYYYY",6,!0],0,"year"),z("year","y"),N("Y",ee),N("YY",_d,Xd),N("YYYY",be,Zd),N("YYYYY",ce,$d),N("YYYYYY",ce,$d),Q(["YYYYY","YYYYYY"],ke),Q("YYYY",function(b,c){c[ke]=2===b.length?a.parseTwoDigitYear(b):q(b)}),Q("YY",function(b,c){c[ke]=a.parseTwoDigitYear(b)}),a.parseTwoDigitYear=function(a){return q(a)+(q(a)>68?1900:2e3)};var ye=C("FullYear",!1);H("w",["ww",2],"wo","week"),H("W",["WW",2],"Wo","isoWeek"),z("week","w"),z("isoWeek","W"),N("w",_d),N("ww",_d,Xd),N("W",_d),N("WW",_d,Xd),R(["w","ww","W","WW"],function(a,b,c,d){b[d.substr(0,1)]=q(a)});var ze={dow:0,doy:6};H("DDD",["DDDD",3],"DDDo","dayOfYear"),z("dayOfYear","DDD"),N("DDD",ae),N("DDDD",Yd),Q(["DDD","DDDD"],function(a,b,c){c._dayOfYear=q(a)}),a.ISO_8601=function(){};var Ae=aa("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548",function(){var a=Da.apply(null,arguments);return this>a?this:a}),Be=aa("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548",function(){var a=Da.apply(null,arguments);return a>this?this:a});Ja("Z",":"),Ja("ZZ",""),N("Z",fe),N("ZZ",fe),Q(["Z","ZZ"],function(a,b,c){c._useUTC=!0,c._tzm=Ka(a)});var Ce=/([\+\-]|\d\d)/gi;a.updateOffset=function(){};var De=/(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,Ee=/^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;Ya.fn=Ha.prototype;var Fe=ab(1,"add"),Ge=ab(-1,"subtract");a.defaultFormat="YYYY-MM-DDTHH:mm:ssZ";var He=aa("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(a){return void 0===a?this.localeData():this.locale(a)});H(0,["gg",2],0,function(){return this.weekYear()%100}),H(0,["GG",2],0,function(){return this.isoWeekYear()%100}),Db("gggg","weekYear"),Db("ggggg","weekYear"),Db("GGGG","isoWeekYear"),Db("GGGGG","isoWeekYear"),z("weekYear","gg"),z("isoWeekYear","GG"),N("G",ee),N("g",ee),N("GG",_d,Xd),N("gg",_d,Xd),N("GGGG",be,Zd),N("gggg",be,Zd),N("GGGGG",ce,$d),N("ggggg",ce,$d),R(["gggg","ggggg","GGGG","GGGGG"],function(a,b,c,d){b[d.substr(0,2)]=q(a)}),R(["gg","GG"],function(b,c,d,e){c[e]=a.parseTwoDigitYear(b)}),H("Q",0,0,"quarter"),z("quarter","Q"),N("Q",Wd),Q("Q",function(a,b){b[le]=3*(q(a)-1)}),H("D",["DD",2],"Do","date"),z("date","D"),N("D",_d),N("DD",_d,Xd),N("Do",function(a,b){return a?b._ordinalParse:b._ordinalParseLenient}),Q(["D","DD"],me),Q("Do",function(a,b){b[me]=q(a.match(_d)[0],10)});var Ie=C("Date",!0);H("d",0,"do","day"),H("dd",0,0,function(a){return this.localeData().weekdaysMin(this,a)}),H("ddd",0,0,function(a){return this.localeData().weekdaysShort(this,a)}),H("dddd",0,0,function(a){return this.localeData().weekdays(this,a)}),H("e",0,0,"weekday"),H("E",0,0,"isoWeekday"),z("day","d"),z("weekday","e"),z("isoWeekday","E"),N("d",_d),N("e",_d),N("E",_d),N("dd",he),N("ddd",he),N("dddd",he),R(["dd","ddd","dddd"],function(a,b,c){var d=c._locale.weekdaysParse(a);null!=d?b.d=d:j(c).invalidWeekday=a}),R(["d","e","E"],function(a,b,c,d){b[d]=q(a)});var Je="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),Ke="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),Le="Su_Mo_Tu_We_Th_Fr_Sa".split("_");H("H",["HH",2],0,"hour"),H("h",["hh",2],0,function(){return this.hours()%12||12}),Sb("a",!0),Sb("A",!1),z("hour","h"),N("a",Tb),N("A",Tb),N("H",_d),N("h",_d),N("HH",_d,Xd),N("hh",_d,Xd),Q(["H","HH"],ne),Q(["a","A"],function(a,b,c){c._isPm=c._locale.isPM(a),c._meridiem=a}),Q(["h","hh"],function(a,b,c){b[ne]=q(a),j(c).bigHour=!0});var Me=/[ap]\.?m?\.?/i,Ne=C("Hours",!0);H("m",["mm",2],0,"minute"),z("minute","m"),N("m",_d),N("mm",_d,Xd),Q(["m","mm"],oe);var Oe=C("Minutes",!1);H("s",["ss",2],0,"second"),z("second","s"),N("s",_d),N("ss",_d,Xd),Q(["s","ss"],pe);var Pe=C("Seconds",!1);H("S",0,0,function(){return~~(this.millisecond()/100)}),H(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),H(0,["SSS",3],0,"millisecond"),H(0,["SSSS",4],0,function(){return 10*this.millisecond()}),H(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),H(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),H(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),H(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),H(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),z("millisecond","ms"),N("S",ae,Wd),N("SS",ae,Xd),N("SSS",ae,Yd);var Qe;for(Qe="SSSS";Qe.length<=9;Qe+="S")N(Qe,de);for(Qe="S";Qe.length<=9;Qe+="S")Q(Qe,Wb);var Re=C("Milliseconds",!1);H("z",0,0,"zoneAbbr"),H("zz",0,0,"zoneName");var Se=n.prototype;Se.add=Fe,Se.calendar=cb,Se.clone=db,Se.diff=ib,Se.endOf=ub,Se.format=mb,Se.from=nb,Se.fromNow=ob,Se.to=pb,Se.toNow=qb,Se.get=F,Se.invalidAt=Cb,Se.isAfter=eb,Se.isBefore=fb,Se.isBetween=gb,Se.isSame=hb,Se.isValid=Ab,Se.lang=He,Se.locale=rb,Se.localeData=sb,Se.max=Be,Se.min=Ae,Se.parsingFlags=Bb,Se.set=F,Se.startOf=tb,Se.subtract=Ge,Se.toArray=yb,Se.toObject=zb,Se.toDate=xb,Se.toISOString=lb,Se.toJSON=lb,Se.toString=kb,Se.unix=wb,Se.valueOf=vb,Se.year=ye,Se.isLeapYear=ia,Se.weekYear=Fb,Se.isoWeekYear=Gb,Se.quarter=Se.quarters=Jb,Se.month=Y,Se.daysInMonth=Z,Se.week=Se.weeks=na,Se.isoWeek=Se.isoWeeks=oa,Se.weeksInYear=Ib,Se.isoWeeksInYear=Hb,Se.date=Ie,Se.day=Se.days=Pb,Se.weekday=Qb,Se.isoWeekday=Rb,Se.dayOfYear=qa,Se.hour=Se.hours=Ne,Se.minute=Se.minutes=Oe,Se.second=Se.seconds=Pe,Se.millisecond=Se.milliseconds=Re,Se.utcOffset=Na,Se.utc=Pa,Se.local=Qa,Se.parseZone=Ra,Se.hasAlignedHourOffset=Sa,Se.isDST=Ta,Se.isDSTShifted=Ua,Se.isLocal=Va,Se.isUtcOffset=Wa,Se.isUtc=Xa,Se.isUTC=Xa,Se.zoneAbbr=Xb,Se.zoneName=Yb,Se.dates=aa("dates accessor is deprecated. Use date instead.",Ie),Se.months=aa("months accessor is deprecated. Use month instead",Y),Se.years=aa("years accessor is deprecated. Use year instead",ye),Se.zone=aa("moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779",Oa);var Te=Se,Ue={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},Ve={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},We="Invalid date",Xe="%d",Ye=/\d{1,2}/,Ze={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},$e=s.prototype;$e._calendar=Ue,$e.calendar=_b,$e._longDateFormat=Ve,$e.longDateFormat=ac,$e._invalidDate=We,$e.invalidDate=bc,$e._ordinal=Xe,$e.ordinal=cc,$e._ordinalParse=Ye,$e.preparse=dc,$e.postformat=dc,$e._relativeTime=Ze,$e.relativeTime=ec,$e.pastFuture=fc,$e.set=gc,$e.months=U,$e._months=re,$e.monthsShort=V,$e._monthsShort=se,$e.monthsParse=W,$e.week=ka,$e._week=ze,$e.firstDayOfYear=ma,$e.firstDayOfWeek=la,$e.weekdays=Lb,$e._weekdays=Je,$e.weekdaysMin=Nb,$e._weekdaysMin=Le,$e.weekdaysShort=Mb,$e._weekdaysShort=Ke,$e.weekdaysParse=Ob,$e.isPM=Ub,$e._meridiemParse=Me,$e.meridiem=Vb,w("en",{ordinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(a){var b=a%10,c=1===q(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),a.lang=aa("moment.lang is deprecated. Use moment.locale instead.",w),a.langData=aa("moment.langData is deprecated. Use moment.localeData instead.",y);var _e=Math.abs,af=yc("ms"),bf=yc("s"),cf=yc("m"),df=yc("h"),ef=yc("d"),ff=yc("w"),gf=yc("M"),hf=yc("y"),jf=Ac("milliseconds"),kf=Ac("seconds"),lf=Ac("minutes"),mf=Ac("hours"),nf=Ac("days"),of=Ac("months"),pf=Ac("years"),qf=Math.round,rf={s:45,m:45,h:22,d:26,M:11},sf=Math.abs,tf=Ha.prototype;tf.abs=oc,tf.add=qc,tf.subtract=rc,tf.as=wc,tf.asMilliseconds=af,tf.asSeconds=bf,tf.asMinutes=cf,tf.asHours=df,tf.asDays=ef,tf.asWeeks=ff,tf.asMonths=gf,tf.asYears=hf,tf.valueOf=xc,tf._bubble=tc,tf.get=zc,tf.milliseconds=jf,tf.seconds=kf,tf.minutes=lf,tf.hours=mf,tf.days=nf,tf.weeks=Bc,tf.months=of,tf.years=pf,tf.humanize=Fc,tf.toISOString=Gc,tf.toString=Gc,tf.toJSON=Gc,tf.locale=rb,tf.localeData=sb,tf.toIsoString=aa("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",Gc),tf.lang=He,H("X",0,0,"unix"),H("x",0,0,"valueOf"),N("x",ee),N("X",ge),Q("X",function(a,b,c){c._d=new Date(1e3*parseFloat(a,10))}),Q("x",function(a,b,c){c._d=new Date(q(a))}),
//! moment.js
//! version : 2.10.6
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
a.version="2.10.6",b(Da),a.fn=Te,a.min=Fa,a.max=Ga,a.utc=h,a.unix=Zb,a.months=jc,a.isDate=d,a.locale=w,a.invalid=l,a.duration=Ya,a.isMoment=o,a.weekdays=lc,a.parseZone=$b,a.localeData=y,a.isDuration=Ia,a.monthsShort=kc,a.weekdaysMin=nc,a.defineLocale=x,a.weekdaysShort=mc,a.normalizeUnits=A,a.relativeTimeThreshold=Ec;var uf=a,vf=(uf.defineLocale("af",{months:"Januarie_Februarie_Maart_April_Mei_Junie_Julie_Augustus_September_Oktober_November_Desember".split("_"),monthsShort:"Jan_Feb_Mar_Apr_Mei_Jun_Jul_Aug_Sep_Okt_Nov_Des".split("_"),weekdays:"Sondag_Maandag_Dinsdag_Woensdag_Donderdag_Vrydag_Saterdag".split("_"),weekdaysShort:"Son_Maa_Din_Woe_Don_Vry_Sat".split("_"),weekdaysMin:"So_Ma_Di_Wo_Do_Vr_Sa".split("_"),meridiemParse:/vm|nm/i,isPM:function(a){return/^nm$/i.test(a)},meridiem:function(a,b,c){return 12>a?c?"vm":"VM":c?"nm":"NM"},longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"},calendar:{sameDay:"[Vandag om] LT",nextDay:"[Môre om] LT",nextWeek:"dddd [om] LT",lastDay:"[Gister om] LT",lastWeek:"[Laas] dddd [om] LT",sameElse:"L"},relativeTime:{future:"oor %s",past:"%s gelede",s:"'n paar sekondes",m:"'n minuut",mm:"%d minute",h:"'n uur",hh:"%d ure",d:"'n dag",dd:"%d dae",M:"'n maand",MM:"%d maande",y:"'n jaar",yy:"%d jaar"},ordinalParse:/\d{1,2}(ste|de)/,ordinal:function(a){return a+(1===a||8===a||a>=20?"ste":"de")},week:{dow:1,doy:4}}),uf.defineLocale("ar-ma",{months:"يناير_فبراير_مارس_أبريل_ماي_يونيو_يوليوز_غشت_شتنبر_أكتوبر_نونبر_دجنبر".split("_"),monthsShort:"يناير_فبراير_مارس_أبريل_ماي_يونيو_يوليوز_غشت_شتنبر_أكتوبر_نونبر_دجنبر".split("_"),weekdays:"الأحد_الإتنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت".split("_"),weekdaysShort:"احد_اتنين_ثلاثاء_اربعاء_خميس_جمعة_سبت".split("_"),weekdaysMin:"ح_ن_ث_ر_خ_ج_س".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},calendar:{sameDay:"[اليوم على الساعة] LT",nextDay:"[غدا على الساعة] LT",nextWeek:"dddd [على الساعة] LT",lastDay:"[أمس على الساعة] LT",lastWeek:"dddd [على الساعة] LT",sameElse:"L"},relativeTime:{future:"في %s",past:"منذ %s",s:"ثوان",m:"دقيقة",mm:"%d دقائق",h:"ساعة",hh:"%d ساعات",d:"يوم",dd:"%d أيام",M:"شهر",MM:"%d أشهر",y:"سنة",yy:"%d سنوات"},week:{dow:6,doy:12}}),{1:"١",2:"٢",3:"٣",4:"٤",5:"٥",6:"٦",7:"٧",8:"٨",9:"٩",0:"٠"}),wf={"١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9","٠":"0"},xf=(uf.defineLocale("ar-sa",{months:"يناير_فبراير_مارس_أبريل_مايو_يونيو_يوليو_أغسطس_سبتمبر_أكتوبر_نوفمبر_ديسمبر".split("_"),monthsShort:"يناير_فبراير_مارس_أبريل_مايو_يونيو_يوليو_أغسطس_سبتمبر_أكتوبر_نوفمبر_ديسمبر".split("_"),weekdays:"الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت".split("_"),weekdaysShort:"أحد_إثنين_ثلاثاء_أربعاء_خميس_جمعة_سبت".split("_"),weekdaysMin:"ح_ن_ث_ر_خ_ج_س".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},meridiemParse:/ص|م/,isPM:function(a){return"م"===a},meridiem:function(a,b,c){return 12>a?"ص":"م"},calendar:{sameDay:"[اليوم على الساعة] LT",nextDay:"[غدا على الساعة] LT",nextWeek:"dddd [على الساعة] LT",lastDay:"[أمس على الساعة] LT",lastWeek:"dddd [على الساعة] LT",sameElse:"L"},relativeTime:{future:"في %s",past:"منذ %s",s:"ثوان",m:"دقيقة",mm:"%d دقائق",h:"ساعة",hh:"%d ساعات",d:"يوم",dd:"%d أيام",M:"شهر",MM:"%d أشهر",y:"سنة",yy:"%d سنوات"},preparse:function(a){return a.replace(/[١٢٣٤٥٦٧٨٩٠]/g,function(a){return wf[a]}).replace(/،/g,",")},postformat:function(a){return a.replace(/\d/g,function(a){return vf[a]}).replace(/,/g,"،")},week:{dow:6,doy:12}}),uf.defineLocale("ar-tn",{months:"جانفي_فيفري_مارس_أفريل_ماي_جوان_جويلية_أوت_سبتمبر_أكتوبر_نوفمبر_ديسمبر".split("_"),monthsShort:"جانفي_فيفري_مارس_أفريل_ماي_جوان_جويلية_أوت_سبتمبر_أكتوبر_نوفمبر_ديسمبر".split("_"),weekdays:"الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت".split("_"),weekdaysShort:"أحد_إثنين_ثلاثاء_أربعاء_خميس_جمعة_سبت".split("_"),weekdaysMin:"ح_ن_ث_ر_خ_ج_س".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},calendar:{sameDay:"[اليوم على الساعة] LT",nextDay:"[غدا على الساعة] LT",nextWeek:"dddd [على الساعة] LT",lastDay:"[أمس على الساعة] LT",lastWeek:"dddd [على الساعة] LT",sameElse:"L"},relativeTime:{future:"في %s",past:"منذ %s",s:"ثوان",m:"دقيقة",mm:"%d دقائق",h:"ساعة",hh:"%d ساعات",d:"يوم",dd:"%d أيام",M:"شهر",MM:"%d أشهر",y:"سنة",yy:"%d سنوات"},week:{dow:1,doy:4}}),{1:"١",2:"٢",3:"٣",4:"٤",5:"٥",6:"٦",7:"٧",8:"٨",9:"٩",0:"٠"}),yf={"١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9","٠":"0"},zf=function(a){return 0===a?0:1===a?1:2===a?2:a%100>=3&&10>=a%100?3:a%100>=11?4:5},Af={s:["أقل من ثانية","ثانية واحدة",["ثانيتان","ثانيتين"],"%d ثوان","%d ثانية","%d ثانية"],m:["أقل من دقيقة","دقيقة واحدة",["دقيقتان","دقيقتين"],"%d دقائق","%d دقيقة","%d دقيقة"],h:["أقل من ساعة","ساعة واحدة",["ساعتان","ساعتين"],"%d ساعات","%d ساعة","%d ساعة"],d:["أقل من يوم","يوم واحد",["يومان","يومين"],"%d أيام","%d يومًا","%d يوم"],M:["أقل من شهر","شهر واحد",["شهران","شهرين"],"%d أشهر","%d شهرا","%d شهر"],y:["أقل من عام","عام واحد",["عامان","عامين"],"%d أعوام","%d عامًا","%d عام"]},Bf=function(a){return function(b,c,d,e){var f=zf(b),g=Af[a][zf(b)];return 2===f&&(g=g[c?0:1]),g.replace(/%d/i,b)}},Cf=["كانون الثاني يناير","شباط فبراير","آذار مارس","نيسان أبريل","أيار مايو","حزيران يونيو","تموز يوليو","آب أغسطس","أيلول سبتمبر","تشرين الأول أكتوبر","تشرين الثاني نوفمبر","كانون الأول ديسمبر"],Df=(uf.defineLocale("ar",{months:Cf,monthsShort:Cf,weekdays:"الأحد_الإثنين_الثلاثاء_الأربعاء_الخميس_الجمعة_السبت".split("_"),weekdaysShort:"أحد_إثنين_ثلاثاء_أربعاء_خميس_جمعة_سبت".split("_"),weekdaysMin:"ح_ن_ث_ر_خ_ج_س".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"D/‏M/‏YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},meridiemParse:/ص|م/,isPM:function(a){return"م"===a},meridiem:function(a,b,c){return 12>a?"ص":"م"},calendar:{sameDay:"[اليوم عند الساعة] LT",nextDay:"[غدًا عند الساعة] LT",nextWeek:"dddd [عند الساعة] LT",lastDay:"[أمس عند الساعة] LT",lastWeek:"dddd [عند الساعة] LT",sameElse:"L"},relativeTime:{future:"بعد %s",past:"منذ %s",s:Bf("s"),m:Bf("m"),mm:Bf("m"),h:Bf("h"),hh:Bf("h"),d:Bf("d"),dd:Bf("d"),M:Bf("M"),MM:Bf("M"),y:Bf("y"),yy:Bf("y")},preparse:function(a){return a.replace(/\u200f/g,"").replace(/[١٢٣٤٥٦٧٨٩٠]/g,function(a){return yf[a]}).replace(/،/g,",")},postformat:function(a){return a.replace(/\d/g,function(a){return xf[a]}).replace(/,/g,"،")},week:{dow:6,doy:12}}),{1:"-inci",5:"-inci",8:"-inci",70:"-inci",80:"-inci",2:"-nci",7:"-nci",20:"-nci",50:"-nci",3:"-üncü",4:"-üncü",100:"-üncü",6:"-ncı",9:"-uncu",10:"-uncu",30:"-uncu",60:"-ıncı",90:"-ıncı"}),Ef=(uf.defineLocale("az",{months:"yanvar_fevral_mart_aprel_may_iyun_iyul_avqust_sentyabr_oktyabr_noyabr_dekabr".split("_"),monthsShort:"yan_fev_mar_apr_may_iyn_iyl_avq_sen_okt_noy_dek".split("_"),weekdays:"Bazar_Bazar ertəsi_Çərşənbə axşamı_Çərşənbə_Cümə axşamı_Cümə_Şənbə".split("_"),weekdaysShort:"Baz_BzE_ÇAx_Çər_CAx_Cüm_Şən".split("_"),weekdaysMin:"Bz_BE_ÇA_Çə_CA_Cü_Şə".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"},calendar:{sameDay:"[bugün saat] LT",nextDay:"[sabah saat] LT",nextWeek:"[gələn həftə] dddd [saat] LT",lastDay:"[dünən] LT",lastWeek:"[keçən həftə] dddd [saat] LT",sameElse:"L"},relativeTime:{future:"%s sonra",past:"%s əvvəl",s:"birneçə saniyyə",m:"bir dəqiqə",mm:"%d dəqiqə",h:"bir saat",hh:"%d saat",d:"bir gün",dd:"%d gün",M:"bir ay",MM:"%d ay",y:"bir il",yy:"%d il"},meridiemParse:/gecə|səhər|gündüz|axşam/,isPM:function(a){return/^(gündüz|axşam)$/.test(a)},meridiem:function(a,b,c){return 4>a?"gecə":12>a?"səhər":17>a?"gündüz":"axşam"},ordinalParse:/\d{1,2}-(ıncı|inci|nci|üncü|ncı|uncu)/,ordinal:function(a){if(0===a)return a+"-ıncı";var b=a%10,c=a%100-b,d=a>=100?100:null;return a+(Df[b]||Df[c]||Df[d])},week:{dow:1,doy:7}}),uf.defineLocale("be",{months:Jc,monthsShort:"студ_лют_сак_крас_трав_чэрв_ліп_жнів_вер_каст_ліст_снеж".split("_"),weekdays:Kc,weekdaysShort:"нд_пн_ат_ср_чц_пт_сб".split("_"),weekdaysMin:"нд_пн_ат_ср_чц_пт_сб".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY г.",LLL:"D MMMM YYYY г., HH:mm",LLLL:"dddd, D MMMM YYYY г., HH:mm"},calendar:{sameDay:"[Сёння ў] LT",nextDay:"[Заўтра ў] LT",lastDay:"[Учора ў] LT",nextWeek:function(){return"[У] dddd [ў] LT"},lastWeek:function(){switch(this.day()){case 0:case 3:case 5:case 6:return"[У мінулую] dddd [ў] LT";case 1:case 2:case 4:return"[У мінулы] dddd [ў] LT"}},sameElse:"L"},relativeTime:{future:"праз %s",past:"%s таму",s:"некалькі секунд",m:Ic,mm:Ic,h:Ic,hh:Ic,d:"дзень",dd:Ic,M:"месяц",MM:Ic,y:"год",yy:Ic},meridiemParse:/ночы|раніцы|дня|вечара/,isPM:function(a){return/^(дня|вечара)$/.test(a)},meridiem:function(a,b,c){return 4>a?"ночы":12>a?"раніцы":17>a?"дня":"вечара"},ordinalParse:/\d{1,2}-(і|ы|га)/,ordinal:function(a,b){switch(b){case"M":case"d":case"DDD":case"w":case"W":return a%10!==2&&a%10!==3||a%100===12||a%100===13?a+"-ы":a+"-і";case"D":return a+"-га";default:return a}},week:{dow:1,doy:7}}),uf.defineLocale("bg",{months:"януари_февруари_март_април_май_юни_юли_август_септември_октомври_ноември_декември".split("_"),monthsShort:"янр_фев_мар_апр_май_юни_юли_авг_сеп_окт_ное_дек".split("_"),weekdays:"неделя_понеделник_вторник_сряда_четвъртък_петък_събота".split("_"),weekdaysShort:"нед_пон_вто_сря_чет_пет_съб".split("_"),weekdaysMin:"нд_пн_вт_ср_чт_пт_сб".split("_"),longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"D.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY H:mm",LLLL:"dddd, D MMMM YYYY H:mm"},calendar:{sameDay:"[Днес в] LT",nextDay:"[Утре в] LT",nextWeek:"dddd [в] LT",lastDay:"[Вчера в] LT",lastWeek:function(){switch(this.day()){case 0:case 3:case 6:return"[В изминалата] dddd [в] LT";case 1:case 2:case 4:case 5:return"[В изминалия] dddd [в] LT"}},sameElse:"L"},relativeTime:{future:"след %s",past:"преди %s",s:"няколко секунди",m:"минута",mm:"%d минути",h:"час",hh:"%d часа",d:"ден",dd:"%d дни",M:"месец",MM:"%d месеца",y:"година",yy:"%d години"},ordinalParse:/\d{1,2}-(ев|ен|ти|ви|ри|ми)/,ordinal:function(a){var b=a%10,c=a%100;return 0===a?a+"-ев":0===c?a+"-ен":c>10&&20>c?a+"-ти":1===b?a+"-ви":2===b?a+"-ри":7===b||8===b?a+"-ми":a+"-ти"},week:{dow:1,doy:7}}),{1:"১",2:"২",3:"৩",4:"৪",5:"৫",6:"৬",7:"৭",8:"৮",9:"৯",0:"০"}),Ff={"১":"1","২":"2","৩":"3","৪":"4","৫":"5","৬":"6","৭":"7","৮":"8","৯":"9","০":"0"},Gf=(uf.defineLocale("bn",{months:"জানুয়ারী_ফেবুয়ারী_মার্চ_এপ্রিল_মে_জুন_জুলাই_অগাস্ট_সেপ্টেম্বর_অক্টোবর_নভেম্বর_ডিসেম্বর".split("_"),monthsShort:"জানু_ফেব_মার্চ_এপর_মে_জুন_জুল_অগ_সেপ্ট_অক্টো_নভ_ডিসেম্".split("_"),weekdays:"রবিবার_সোমবার_মঙ্গলবার_বুধবার_বৃহস্পত্তিবার_শুক্রুবার_শনিবার".split("_"),weekdaysShort:"রবি_সোম_মঙ্গল_বুধ_বৃহস্পত্তি_শুক্রু_শনি".split("_"),weekdaysMin:"রব_সম_মঙ্গ_বু_ব্রিহ_শু_শনি".split("_"),longDateFormat:{LT:"A h:mm সময়",LTS:"A h:mm:ss সময়",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY, A h:mm সময়",LLLL:"dddd, D MMMM YYYY, A h:mm সময়"},calendar:{sameDay:"[আজ] LT",nextDay:"[আগামীকাল] LT",nextWeek:"dddd, LT",lastDay:"[গতকাল] LT",lastWeek:"[গত] dddd, LT",sameElse:"L"},relativeTime:{future:"%s পরে",past:"%s আগে",s:"কএক সেকেন্ড",m:"এক মিনিট",mm:"%d মিনিট",h:"এক ঘন্টা",hh:"%d ঘন্টা",d:"এক দিন",dd:"%d দিন",M:"এক মাস",MM:"%d মাস",y:"এক বছর",yy:"%d বছর"},preparse:function(a){return a.replace(/[১২৩৪৫৬৭৮৯০]/g,function(a){return Ff[a]})},postformat:function(a){return a.replace(/\d/g,function(a){return Ef[a]})},meridiemParse:/রাত|সকাল|দুপুর|বিকেল|রাত/,isPM:function(a){return/^(দুপুর|বিকেল|রাত)$/.test(a)},meridiem:function(a,b,c){return 4>a?"রাত":10>a?"সকাল":17>a?"দুপুর":20>a?"বিকেল":"রাত"},week:{dow:0,doy:6}}),{1:"༡",2:"༢",3:"༣",4:"༤",5:"༥",6:"༦",7:"༧",8:"༨",9:"༩",0:"༠"}),Hf={"༡":"1","༢":"2","༣":"3","༤":"4","༥":"5","༦":"6","༧":"7","༨":"8","༩":"9","༠":"0"},If=(uf.defineLocale("bo",{months:"ཟླ་བ་དང་པོ_ཟླ་བ་གཉིས་པ_ཟླ་བ་གསུམ་པ_ཟླ་བ་བཞི་པ_ཟླ་བ་ལྔ་པ_ཟླ་བ་དྲུག་པ_ཟླ་བ་བདུན་པ_ཟླ་བ་བརྒྱད་པ_ཟླ་བ་དགུ་པ_ཟླ་བ་བཅུ་པ_ཟླ་བ་བཅུ་གཅིག་པ_ཟླ་བ་བཅུ་གཉིས་པ".split("_"),monthsShort:"ཟླ་བ་དང་པོ_ཟླ་བ་གཉིས་པ_ཟླ་བ་གསུམ་པ_ཟླ་བ་བཞི་པ_ཟླ་བ་ལྔ་པ_ཟླ་བ་དྲུག་པ_ཟླ་བ་བདུན་པ_ཟླ་བ་བརྒྱད་པ_ཟླ་བ་དགུ་པ_ཟླ་བ་བཅུ་པ_ཟླ་བ་བཅུ་གཅིག་པ_ཟླ་བ་བཅུ་གཉིས་པ".split("_"),weekdays:"གཟའ་ཉི་མ་_གཟའ་ཟླ་བ་_གཟའ་མིག་དམར་_གཟའ་ལྷག་པ་_གཟའ་ཕུར་བུ_གཟའ་པ་སངས་_གཟའ་སྤེན་པ་".split("_"),weekdaysShort:"ཉི་མ་_ཟླ་བ་_མིག་དམར་_ལྷག་པ་_ཕུར་བུ_པ་སངས་_སྤེན་པ་".split("_"),weekdaysMin:"ཉི་མ་_ཟླ་བ་_མིག་དམར་_ལྷག་པ་_ཕུར་བུ_པ་སངས་_སྤེན་པ་".split("_"),longDateFormat:{LT:"A h:mm",LTS:"A h:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY, A h:mm",LLLL:"dddd, D MMMM YYYY, A h:mm"},calendar:{sameDay:"[དི་རིང] LT",nextDay:"[སང་ཉིན] LT",nextWeek:"[བདུན་ཕྲག་རྗེས་མ], LT",lastDay:"[ཁ་སང] LT",lastWeek:"[བདུན་ཕྲག་མཐའ་མ] dddd, LT",sameElse:"L"},relativeTime:{future:"%s ལ་",past:"%s སྔན་ལ",s:"ལམ་སང",m:"སྐར་མ་གཅིག",mm:"%d སྐར་མ",h:"ཆུ་ཚོད་གཅིག",hh:"%d ཆུ་ཚོད",d:"ཉིན་གཅིག",dd:"%d ཉིན་",M:"ཟླ་བ་གཅིག",MM:"%d ཟླ་བ",y:"ལོ་གཅིག",yy:"%d ལོ"},preparse:function(a){return a.replace(/[༡༢༣༤༥༦༧༨༩༠]/g,function(a){return Hf[a]})},postformat:function(a){return a.replace(/\d/g,function(a){return Gf[a]})},meridiemParse:/མཚན་མོ|ཞོགས་ཀས|ཉིན་གུང|དགོང་དག|མཚན་མོ/,isPM:function(a){return/^(ཉིན་གུང|དགོང་དག|མཚན་མོ)$/.test(a)},meridiem:function(a,b,c){return 4>a?"མཚན་མོ":10>a?"ཞོགས་ཀས":17>a?"ཉིན་གུང":20>a?"དགོང་དག":"མཚན་མོ"},week:{dow:0,doy:6}}),uf.defineLocale("br",{months:"Genver_C'hwevrer_Meurzh_Ebrel_Mae_Mezheven_Gouere_Eost_Gwengolo_Here_Du_Kerzu".split("_"),monthsShort:"Gen_C'hwe_Meu_Ebr_Mae_Eve_Gou_Eos_Gwe_Her_Du_Ker".split("_"),weekdays:"Sul_Lun_Meurzh_Merc'her_Yaou_Gwener_Sadorn".split("_"),weekdaysShort:"Sul_Lun_Meu_Mer_Yao_Gwe_Sad".split("_"),weekdaysMin:"Su_Lu_Me_Mer_Ya_Gw_Sa".split("_"),longDateFormat:{LT:"h[e]mm A",LTS:"h[e]mm:ss A",L:"DD/MM/YYYY",LL:"D [a viz] MMMM YYYY",LLL:"D [a viz] MMMM YYYY h[e]mm A",LLLL:"dddd, D [a viz] MMMM YYYY h[e]mm A"},calendar:{sameDay:"[Hiziv da] LT",nextDay:"[Warc'hoazh da] LT",nextWeek:"dddd [da] LT",lastDay:"[Dec'h da] LT",lastWeek:"dddd [paset da] LT",sameElse:"L"},relativeTime:{future:"a-benn %s",past:"%s 'zo",s:"un nebeud segondennoù",m:"ur vunutenn",mm:Lc,h:"un eur",hh:"%d eur",d:"un devezh",dd:Lc,M:"ur miz",MM:Lc,y:"ur bloaz",yy:Mc},ordinalParse:/\d{1,2}(añ|vet)/,ordinal:function(a){var b=1===a?"añ":"vet";return a+b},week:{dow:1,doy:4}}),uf.defineLocale("bs",{months:"januar_februar_mart_april_maj_juni_juli_august_septembar_oktobar_novembar_decembar".split("_"),monthsShort:"jan._feb._mar._apr._maj._jun._jul._aug._sep._okt._nov._dec.".split("_"),weekdays:"nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota".split("_"),weekdaysShort:"ned._pon._uto._sri._čet._pet._sub.".split("_"),weekdaysMin:"ne_po_ut_sr_če_pe_su".split("_"),longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"DD. MM. YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm"},calendar:{sameDay:"[danas u] LT",nextDay:"[sutra u] LT",nextWeek:function(){switch(this.day()){case 0:return"[u] [nedjelju] [u] LT";case 3:return"[u] [srijedu] [u] LT";case 6:return"[u] [subotu] [u] LT";case 1:case 2:case 4:case 5:return"[u] dddd [u] LT"}},lastDay:"[jučer u] LT",lastWeek:function(){switch(this.day()){case 0:case 3:return"[prošlu] dddd [u] LT";case 6:return"[prošle] [subote] [u] LT";case 1:case 2:case 4:case 5:return"[prošli] dddd [u] LT"}},sameElse:"L"},relativeTime:{future:"za %s",past:"prije %s",s:"par sekundi",m:Qc,mm:Qc,h:Qc,hh:Qc,d:"dan",dd:Qc,M:"mjesec",MM:Qc,y:"godinu",yy:Qc},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:7}}),uf.defineLocale("ca",{months:"gener_febrer_març_abril_maig_juny_juliol_agost_setembre_octubre_novembre_desembre".split("_"),monthsShort:"gen._febr._mar._abr._mai._jun._jul._ag._set._oct._nov._des.".split("_"),weekdays:"diumenge_dilluns_dimarts_dimecres_dijous_divendres_dissabte".split("_"),weekdaysShort:"dg._dl._dt._dc._dj._dv._ds.".split("_"),weekdaysMin:"Dg_Dl_Dt_Dc_Dj_Dv_Ds".split("_"),longDateFormat:{LT:"H:mm",LTS:"LT:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY H:mm",LLLL:"dddd D MMMM YYYY H:mm"},calendar:{sameDay:function(){return"[avui a "+(1!==this.hours()?"les":"la")+"] LT"},nextDay:function(){return"[demà a "+(1!==this.hours()?"les":"la")+"] LT"},nextWeek:function(){return"dddd [a "+(1!==this.hours()?"les":"la")+"] LT"},lastDay:function(){return"[ahir a "+(1!==this.hours()?"les":"la")+"] LT"},lastWeek:function(){return"[el] dddd [passat a "+(1!==this.hours()?"les":"la")+"] LT"},sameElse:"L"},relativeTime:{future:"en %s",past:"fa %s",s:"uns segons",m:"un minut",mm:"%d minuts",h:"una hora",hh:"%d hores",d:"un dia",dd:"%d dies",M:"un mes",MM:"%d mesos",y:"un any",yy:"%d anys"},ordinalParse:/\d{1,2}(r|n|t|è|a)/,ordinal:function(a,b){var c=1===a?"r":2===a?"n":3===a?"r":4===a?"t":"è";return("w"===b||"W"===b)&&(c="a"),a+c},week:{dow:1,doy:4}}),"leden_únor_březen_duben_květen_červen_červenec_srpen_září_říjen_listopad_prosinec".split("_")),Jf="led_úno_bře_dub_kvě_čvn_čvc_srp_zář_říj_lis_pro".split("_"),Kf=(uf.defineLocale("cs",{months:If,monthsShort:Jf,monthsParse:function(a,b){var c,d=[];for(c=0;12>c;c++)d[c]=new RegExp("^"+a[c]+"$|^"+b[c]+"$","i");return d}(If,Jf),weekdays:"neděle_pondělí_úterý_středa_čtvrtek_pátek_sobota".split("_"),weekdaysShort:"ne_po_út_st_čt_pá_so".split("_"),weekdaysMin:"ne_po_út_st_čt_pá_so".split("_"),longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd D. MMMM YYYY H:mm"},calendar:{sameDay:"[dnes v] LT",nextDay:"[zítra v] LT",nextWeek:function(){switch(this.day()){case 0:return"[v neděli v] LT";case 1:case 2:return"[v] dddd [v] LT";case 3:return"[ve středu v] LT";case 4:return"[ve čtvrtek v] LT";case 5:return"[v pátek v] LT";case 6:return"[v sobotu v] LT"}},lastDay:"[včera v] LT",lastWeek:function(){switch(this.day()){case 0:return"[minulou neděli v] LT";case 1:case 2:return"[minulé] dddd [v] LT";case 3:return"[minulou středu v] LT";case 4:case 5:return"[minulý] dddd [v] LT";case 6:return"[minulou sobotu v] LT"}},sameElse:"L"},relativeTime:{future:"za %s",past:"před %s",s:Sc,m:Sc,mm:Sc,h:Sc,hh:Sc,d:Sc,dd:Sc,M:Sc,MM:Sc,y:Sc,yy:Sc},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),uf.defineLocale("cv",{months:"кӑрлач_нарӑс_пуш_ака_май_ҫӗртме_утӑ_ҫурла_авӑн_юпа_чӳк_раштав".split("_"),monthsShort:"кӑр_нар_пуш_ака_май_ҫӗр_утӑ_ҫур_авн_юпа_чӳк_раш".split("_"),weekdays:"вырсарникун_тунтикун_ытларикун_юнкун_кӗҫнерникун_эрнекун_шӑматкун".split("_"),weekdaysShort:"выр_тун_ытл_юн_кӗҫ_эрн_шӑм".split("_"),weekdaysMin:"вр_тн_ыт_юн_кҫ_эр_шм".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD-MM-YYYY",LL:"YYYY [ҫулхи] MMMM [уйӑхӗн] D[-мӗшӗ]",LLL:"YYYY [ҫулхи] MMMM [уйӑхӗн] D[-мӗшӗ], HH:mm",LLLL:"dddd, YYYY [ҫулхи] MMMM [уйӑхӗн] D[-мӗшӗ], HH:mm"},calendar:{sameDay:"[Паян] LT [сехетре]",nextDay:"[Ыран] LT [сехетре]",lastDay:"[Ӗнер] LT [сехетре]",nextWeek:"[Ҫитес] dddd LT [сехетре]",lastWeek:"[Иртнӗ] dddd LT [сехетре]",sameElse:"L"},relativeTime:{future:function(a){var b=/сехет$/i.exec(a)?"рен":/ҫул$/i.exec(a)?"тан":"ран";return a+b},past:"%s каялла",s:"пӗр-ик ҫеккунт",m:"пӗр минут",mm:"%d минут",h:"пӗр сехет",hh:"%d сехет",d:"пӗр кун",dd:"%d кун",M:"пӗр уйӑх",MM:"%d уйӑх",y:"пӗр ҫул",yy:"%d ҫул"},ordinalParse:/\d{1,2}-мӗш/,ordinal:"%d-мӗш",week:{dow:1,doy:7}}),uf.defineLocale("cy",{months:"Ionawr_Chwefror_Mawrth_Ebrill_Mai_Mehefin_Gorffennaf_Awst_Medi_Hydref_Tachwedd_Rhagfyr".split("_"),monthsShort:"Ion_Chwe_Maw_Ebr_Mai_Meh_Gor_Aws_Med_Hyd_Tach_Rhag".split("_"),weekdays:"Dydd Sul_Dydd Llun_Dydd Mawrth_Dydd Mercher_Dydd Iau_Dydd Gwener_Dydd Sadwrn".split("_"),weekdaysShort:"Sul_Llun_Maw_Mer_Iau_Gwe_Sad".split("_"),weekdaysMin:"Su_Ll_Ma_Me_Ia_Gw_Sa".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"},calendar:{sameDay:"[Heddiw am] LT",nextDay:"[Yfory am] LT",nextWeek:"dddd [am] LT",lastDay:"[Ddoe am] LT",lastWeek:"dddd [diwethaf am] LT",sameElse:"L"},relativeTime:{future:"mewn %s",past:"%s yn ôl",s:"ychydig eiliadau",m:"munud",mm:"%d munud",h:"awr",hh:"%d awr",d:"diwrnod",dd:"%d diwrnod",M:"mis",MM:"%d mis",y:"blwyddyn",yy:"%d flynedd"},ordinalParse:/\d{1,2}(fed|ain|af|il|ydd|ed|eg)/,ordinal:function(a){var b=a,c="",d=["","af","il","ydd","ydd","ed","ed","ed","fed","fed","fed","eg","fed","eg","eg","fed","eg","eg","fed","eg","fed"];return b>20?c=40===b||50===b||60===b||80===b||100===b?"fed":"ain":b>0&&(c=d[b]),a+c},week:{dow:1,doy:4}}),uf.defineLocale("da",{months:"januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december".split("_"),monthsShort:"jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec".split("_"),weekdays:"søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag".split("_"),weekdaysShort:"søn_man_tir_ons_tor_fre_lør".split("_"),weekdaysMin:"sø_ma_ti_on_to_fr_lø".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY HH:mm",LLLL:"dddd [d.] D. MMMM YYYY HH:mm"},calendar:{sameDay:"[I dag kl.] LT",nextDay:"[I morgen kl.] LT",nextWeek:"dddd [kl.] LT",lastDay:"[I går kl.] LT",lastWeek:"[sidste] dddd [kl] LT",sameElse:"L"},relativeTime:{future:"om %s",past:"%s siden",s:"få sekunder",m:"et minut",mm:"%d minutter",h:"en time",hh:"%d timer",d:"en dag",dd:"%d dage",M:"en måned",MM:"%d måneder",y:"et år",yy:"%d år"},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),uf.defineLocale("de-at",{months:"Jänner_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),monthsShort:"Jän._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),weekdays:"Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag".split("_"),weekdaysShort:"So._Mo._Di._Mi._Do._Fr._Sa.".split("_"),weekdaysMin:"So_Mo_Di_Mi_Do_Fr_Sa".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY HH:mm",LLLL:"dddd, D. MMMM YYYY HH:mm"},calendar:{sameDay:"[Heute um] LT [Uhr]",sameElse:"L",nextDay:"[Morgen um] LT [Uhr]",nextWeek:"dddd [um] LT [Uhr]",lastDay:"[Gestern um] LT [Uhr]",lastWeek:"[letzten] dddd [um] LT [Uhr]"},relativeTime:{future:"in %s",past:"vor %s",s:"ein paar Sekunden",m:Tc,mm:"%d Minuten",h:Tc,hh:"%d Stunden",d:Tc,dd:Tc,M:Tc,MM:Tc,y:Tc,yy:Tc},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),uf.defineLocale("de",{months:"Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),monthsShort:"Jan._Febr._Mrz._Apr._Mai_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),weekdays:"Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag".split("_"),weekdaysShort:"So._Mo._Di._Mi._Do._Fr._Sa.".split("_"),weekdaysMin:"So_Mo_Di_Mi_Do_Fr_Sa".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY HH:mm",LLLL:"dddd, D. MMMM YYYY HH:mm"},calendar:{sameDay:"[Heute um] LT [Uhr]",sameElse:"L",nextDay:"[Morgen um] LT [Uhr]",nextWeek:"dddd [um] LT [Uhr]",lastDay:"[Gestern um] LT [Uhr]",lastWeek:"[letzten] dddd [um] LT [Uhr]"},relativeTime:{future:"in %s",past:"vor %s",s:"ein paar Sekunden",m:Uc,mm:"%d Minuten",h:Uc,hh:"%d Stunden",d:Uc,dd:Uc,M:Uc,MM:Uc,y:Uc,yy:Uc},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),uf.defineLocale("el",{monthsNominativeEl:"Ιανουάριος_Φεβρουάριος_Μάρτιος_Απρίλιος_Μάιος_Ιούνιος_Ιούλιος_Αύγουστος_Σεπτέμβριος_Οκτώβριος_Νοέμβριος_Δεκέμβριος".split("_"),monthsGenitiveEl:"Ιανουαρίου_Φεβρουαρίου_Μαρτίου_Απριλίου_Μαΐου_Ιουνίου_Ιουλίου_Αυγούστου_Σεπτεμβρίου_Οκτωβρίου_Νοεμβρίου_Δεκεμβρίου".split("_"),months:function(a,b){return/D/.test(b.substring(0,b.indexOf("MMMM")))?this._monthsGenitiveEl[a.month()]:this._monthsNominativeEl[a.month()]},monthsShort:"Ιαν_Φεβ_Μαρ_Απρ_Μαϊ_Ιουν_Ιουλ_Αυγ_Σεπ_Οκτ_Νοε_Δεκ".split("_"),weekdays:"Κυριακή_Δευτέρα_Τρίτη_Τετάρτη_Πέμπτη_Παρασκευή_Σάββατο".split("_"),weekdaysShort:"Κυρ_Δευ_Τρι_Τετ_Πεμ_Παρ_Σαβ".split("_"),weekdaysMin:"Κυ_Δε_Τρ_Τε_Πε_Πα_Σα".split("_"),meridiem:function(a,b,c){return a>11?c?"μμ":"ΜΜ":c?"πμ":"ΠΜ"},isPM:function(a){return"μ"===(a+"").toLowerCase()[0]},meridiemParse:/[ΠΜ]\.?Μ?\.?/i,longDateFormat:{LT:"h:mm A",LTS:"h:mm:ss A",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY h:mm A",LLLL:"dddd, D MMMM YYYY h:mm A"},calendarEl:{sameDay:"[Σήμερα {}] LT",nextDay:"[Αύριο {}] LT",nextWeek:"dddd [{}] LT",lastDay:"[Χθες {}] LT",lastWeek:function(){switch(this.day()){case 6:return"[το προηγούμενο] dddd [{}] LT";default:return"[την προηγούμενη] dddd [{}] LT"}},sameElse:"L"},calendar:function(a,b){var c=this._calendarEl[a],d=b&&b.hours();return"function"==typeof c&&(c=c.apply(b)),c.replace("{}",d%12===1?"στη":"στις")},relativeTime:{future:"σε %s",past:"%s πριν",s:"λίγα δευτερόλεπτα",m:"ένα λεπτό",mm:"%d λεπτά",h:"μία ώρα",hh:"%d ώρες",d:"μία μέρα",dd:"%d μέρες",M:"ένας μήνας",MM:"%d μήνες",y:"ένας χρόνος",yy:"%d χρόνια"},ordinalParse:/\d{1,2}η/,ordinal:"%dη",week:{dow:1,doy:4}}),uf.defineLocale("en-au",{months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),longDateFormat:{LT:"h:mm A",LTS:"h:mm:ss A",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY h:mm A",LLLL:"dddd, D MMMM YYYY h:mm A"},calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},ordinalParse:/\d{1,2}(st|nd|rd|th)/,ordinal:function(a){var b=a%10,c=1===~~(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c},week:{dow:1,doy:4}}),uf.defineLocale("en-ca",{months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),longDateFormat:{LT:"h:mm A",LTS:"h:mm:ss A",L:"YYYY-MM-DD",LL:"D MMMM, YYYY",LLL:"D MMMM, YYYY h:mm A",LLLL:"dddd, D MMMM, YYYY h:mm A"},calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},ordinalParse:/\d{1,2}(st|nd|rd|th)/,ordinal:function(a){var b=a%10,c=1===~~(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),uf.defineLocale("en-gb",{months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),monthsShort:"Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),weekdaysShort:"Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),weekdaysMin:"Su_Mo_Tu_We_Th_Fr_Sa".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"},calendar:{sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},relativeTime:{future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},ordinalParse:/\d{1,2}(st|nd|rd|th)/,ordinal:function(a){var b=a%10,c=1===~~(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c},week:{dow:1,doy:4}}),uf.defineLocale("eo",{months:"januaro_februaro_marto_aprilo_majo_junio_julio_aŭgusto_septembro_oktobro_novembro_decembro".split("_"),monthsShort:"jan_feb_mar_apr_maj_jun_jul_aŭg_sep_okt_nov_dec".split("_"),weekdays:"Dimanĉo_Lundo_Mardo_Merkredo_Ĵaŭdo_Vendredo_Sabato".split("_"),weekdaysShort:"Dim_Lun_Mard_Merk_Ĵaŭ_Ven_Sab".split("_"),weekdaysMin:"Di_Lu_Ma_Me_Ĵa_Ve_Sa".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY-MM-DD",LL:"D[-an de] MMMM, YYYY",LLL:"D[-an de] MMMM, YYYY HH:mm",LLLL:"dddd, [la] D[-an de] MMMM, YYYY HH:mm"},meridiemParse:/[ap]\.t\.m/i,isPM:function(a){return"p"===a.charAt(0).toLowerCase()},meridiem:function(a,b,c){return a>11?c?"p.t.m.":"P.T.M.":c?"a.t.m.":"A.T.M."},calendar:{sameDay:"[Hodiaŭ je] LT",nextDay:"[Morgaŭ je] LT",nextWeek:"dddd [je] LT",lastDay:"[Hieraŭ je] LT",lastWeek:"[pasinta] dddd [je] LT",sameElse:"L"},relativeTime:{future:"je %s",past:"antaŭ %s",s:"sekundoj",m:"minuto",mm:"%d minutoj",h:"horo",hh:"%d horoj",d:"tago",dd:"%d tagoj",M:"monato",MM:"%d monatoj",y:"jaro",yy:"%d jaroj"},ordinalParse:/\d{1,2}a/,ordinal:"%da",week:{dow:1,doy:7}}),"Ene._Feb._Mar._Abr._May._Jun._Jul._Ago._Sep._Oct._Nov._Dic.".split("_")),Lf="Ene_Feb_Mar_Abr_May_Jun_Jul_Ago_Sep_Oct_Nov_Dic".split("_"),Mf=(uf.defineLocale("es",{months:"Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split("_"),monthsShort:function(a,b){return/-MMM-/.test(b)?Lf[a.month()]:Kf[a.month()]},weekdays:"Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado".split("_"),weekdaysShort:"Dom._Lun._Mar._Mié._Jue._Vie._Sáb.".split("_"),weekdaysMin:"Do_Lu_Ma_Mi_Ju_Vi_Sá".split("_"),longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D [de] MMMM [de] YYYY",LLL:"D [de] MMMM [de] YYYY H:mm",LLLL:"dddd, D [de] MMMM [de] YYYY H:mm"},calendar:{sameDay:function(){return"[hoy a la"+(1!==this.hours()?"s":"")+"] LT"},nextDay:function(){return"[mañana a la"+(1!==this.hours()?"s":"")+"] LT"},nextWeek:function(){return"dddd [a la"+(1!==this.hours()?"s":"")+"] LT"},lastDay:function(){return"[ayer a la"+(1!==this.hours()?"s":"")+"] LT"},lastWeek:function(){return"[el] dddd [pasado a la"+(1!==this.hours()?"s":"")+"] LT"},sameElse:"L"},relativeTime:{future:"en %s",past:"hace %s",s:"unos segundos",m:"un minuto",mm:"%d minutos",h:"una hora",hh:"%d horas",d:"un día",dd:"%d días",M:"un mes",MM:"%d meses",y:"un año",yy:"%d años"},ordinalParse:/\d{1,2}º/,ordinal:"%dº",week:{dow:1,doy:4}}),uf.defineLocale("et",{months:"jaanuar_veebruar_märts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember".split("_"),monthsShort:"jaan_veebr_märts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets".split("_"),weekdays:"pühapäev_esmaspäev_teisipäev_kolmapäev_neljapäev_reede_laupäev".split("_"),weekdaysShort:"P_E_T_K_N_R_L".split("_"),weekdaysMin:"P_E_T_K_N_R_L".split("_"),longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm"},calendar:{sameDay:"[Täna,] LT",nextDay:"[Homme,] LT",nextWeek:"[Järgmine] dddd LT",lastDay:"[Eile,] LT",lastWeek:"[Eelmine] dddd LT",sameElse:"L"},relativeTime:{future:"%s pärast",past:"%s tagasi",s:Vc,m:Vc,mm:Vc,h:Vc,hh:Vc,d:Vc,dd:"%d päeva",M:Vc,MM:Vc,y:Vc,yy:Vc},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),uf.defineLocale("eu",{months:"urtarrila_otsaila_martxoa_apirila_maiatza_ekaina_uztaila_abuztua_iraila_urria_azaroa_abendua".split("_"),monthsShort:"urt._ots._mar._api._mai._eka._uzt._abu._ira._urr._aza._abe.".split("_"),weekdays:"igandea_astelehena_asteartea_asteazkena_osteguna_ostirala_larunbata".split("_"),weekdaysShort:"ig._al._ar._az._og._ol._lr.".split("_"),weekdaysMin:"ig_al_ar_az_og_ol_lr".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY-MM-DD",LL:"YYYY[ko] MMMM[ren] D[a]",LLL:"YYYY[ko] MMMM[ren] D[a] HH:mm",LLLL:"dddd, YYYY[ko] MMMM[ren] D[a] HH:mm",l:"YYYY-M-D",ll:"YYYY[ko] MMM D[a]",lll:"YYYY[ko] MMM D[a] HH:mm",llll:"ddd, YYYY[ko] MMM D[a] HH:mm"},calendar:{sameDay:"[gaur] LT[etan]",nextDay:"[bihar] LT[etan]",nextWeek:"dddd LT[etan]",
lastDay:"[atzo] LT[etan]",lastWeek:"[aurreko] dddd LT[etan]",sameElse:"L"},relativeTime:{future:"%s barru",past:"duela %s",s:"segundo batzuk",m:"minutu bat",mm:"%d minutu",h:"ordu bat",hh:"%d ordu",d:"egun bat",dd:"%d egun",M:"hilabete bat",MM:"%d hilabete",y:"urte bat",yy:"%d urte"},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:7}}),{1:"۱",2:"۲",3:"۳",4:"۴",5:"۵",6:"۶",7:"۷",8:"۸",9:"۹",0:"۰"}),Nf={"۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9","۰":"0"},Of=(uf.defineLocale("fa",{months:"ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر".split("_"),monthsShort:"ژانویه_فوریه_مارس_آوریل_مه_ژوئن_ژوئیه_اوت_سپتامبر_اکتبر_نوامبر_دسامبر".split("_"),weekdays:"یک‌شنبه_دوشنبه_سه‌شنبه_چهارشنبه_پنج‌شنبه_جمعه_شنبه".split("_"),weekdaysShort:"یک‌شنبه_دوشنبه_سه‌شنبه_چهارشنبه_پنج‌شنبه_جمعه_شنبه".split("_"),weekdaysMin:"ی_د_س_چ_پ_ج_ش".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"},meridiemParse:/قبل از ظهر|بعد از ظهر/,isPM:function(a){return/بعد از ظهر/.test(a)},meridiem:function(a,b,c){return 12>a?"قبل از ظهر":"بعد از ظهر"},calendar:{sameDay:"[امروز ساعت] LT",nextDay:"[فردا ساعت] LT",nextWeek:"dddd [ساعت] LT",lastDay:"[دیروز ساعت] LT",lastWeek:"dddd [پیش] [ساعت] LT",sameElse:"L"},relativeTime:{future:"در %s",past:"%s پیش",s:"چندین ثانیه",m:"یک دقیقه",mm:"%d دقیقه",h:"یک ساعت",hh:"%d ساعت",d:"یک روز",dd:"%d روز",M:"یک ماه",MM:"%d ماه",y:"یک سال",yy:"%d سال"},preparse:function(a){return a.replace(/[۰-۹]/g,function(a){return Nf[a]}).replace(/،/g,",")},postformat:function(a){return a.replace(/\d/g,function(a){return Mf[a]}).replace(/,/g,"،")},ordinalParse:/\d{1,2}م/,ordinal:"%dم",week:{dow:6,doy:12}}),"nolla yksi kaksi kolme neljä viisi kuusi seitsemän kahdeksan yhdeksän".split(" ")),Pf=["nolla","yhden","kahden","kolmen","neljän","viiden","kuuden",Of[7],Of[8],Of[9]],Qf=(uf.defineLocale("fi",{months:"tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesäkuu_heinäkuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu".split("_"),monthsShort:"tammi_helmi_maalis_huhti_touko_kesä_heinä_elo_syys_loka_marras_joulu".split("_"),weekdays:"sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai".split("_"),weekdaysShort:"su_ma_ti_ke_to_pe_la".split("_"),weekdaysMin:"su_ma_ti_ke_to_pe_la".split("_"),longDateFormat:{LT:"HH.mm",LTS:"HH.mm.ss",L:"DD.MM.YYYY",LL:"Do MMMM[ta] YYYY",LLL:"Do MMMM[ta] YYYY, [klo] HH.mm",LLLL:"dddd, Do MMMM[ta] YYYY, [klo] HH.mm",l:"D.M.YYYY",ll:"Do MMM YYYY",lll:"Do MMM YYYY, [klo] HH.mm",llll:"ddd, Do MMM YYYY, [klo] HH.mm"},calendar:{sameDay:"[tänään] [klo] LT",nextDay:"[huomenna] [klo] LT",nextWeek:"dddd [klo] LT",lastDay:"[eilen] [klo] LT",lastWeek:"[viime] dddd[na] [klo] LT",sameElse:"L"},relativeTime:{future:"%s päästä",past:"%s sitten",s:Wc,m:Wc,mm:Wc,h:Wc,hh:Wc,d:Wc,dd:Wc,M:Wc,MM:Wc,y:Wc,yy:Wc},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),uf.defineLocale("fo",{months:"januar_februar_mars_apríl_mai_juni_juli_august_september_oktober_november_desember".split("_"),monthsShort:"jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),weekdays:"sunnudagur_mánadagur_týsdagur_mikudagur_hósdagur_fríggjadagur_leygardagur".split("_"),weekdaysShort:"sun_mán_týs_mik_hós_frí_ley".split("_"),weekdaysMin:"su_má_tý_mi_hó_fr_le".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D. MMMM, YYYY HH:mm"},calendar:{sameDay:"[Í dag kl.] LT",nextDay:"[Í morgin kl.] LT",nextWeek:"dddd [kl.] LT",lastDay:"[Í gjár kl.] LT",lastWeek:"[síðstu] dddd [kl] LT",sameElse:"L"},relativeTime:{future:"um %s",past:"%s síðani",s:"fá sekund",m:"ein minutt",mm:"%d minuttir",h:"ein tími",hh:"%d tímar",d:"ein dagur",dd:"%d dagar",M:"ein mánaði",MM:"%d mánaðir",y:"eitt ár",yy:"%d ár"},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),uf.defineLocale("fr-ca",{months:"janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),monthsShort:"janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),weekdays:"dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),weekdaysShort:"dim._lun._mar._mer._jeu._ven._sam.".split("_"),weekdaysMin:"Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY-MM-DD",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},calendar:{sameDay:"[Aujourd'hui à] LT",nextDay:"[Demain à] LT",nextWeek:"dddd [à] LT",lastDay:"[Hier à] LT",lastWeek:"dddd [dernier à] LT",sameElse:"L"},relativeTime:{future:"dans %s",past:"il y a %s",s:"quelques secondes",m:"une minute",mm:"%d minutes",h:"une heure",hh:"%d heures",d:"un jour",dd:"%d jours",M:"un mois",MM:"%d mois",y:"un an",yy:"%d ans"},ordinalParse:/\d{1,2}(er|e)/,ordinal:function(a){return a+(1===a?"er":"e")}}),uf.defineLocale("fr",{months:"janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),monthsShort:"janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),weekdays:"dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),weekdaysShort:"dim._lun._mar._mer._jeu._ven._sam.".split("_"),weekdaysMin:"Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},calendar:{sameDay:"[Aujourd'hui à] LT",nextDay:"[Demain à] LT",nextWeek:"dddd [à] LT",lastDay:"[Hier à] LT",lastWeek:"dddd [dernier à] LT",sameElse:"L"},relativeTime:{future:"dans %s",past:"il y a %s",s:"quelques secondes",m:"une minute",mm:"%d minutes",h:"une heure",hh:"%d heures",d:"un jour",dd:"%d jours",M:"un mois",MM:"%d mois",y:"un an",yy:"%d ans"},ordinalParse:/\d{1,2}(er|)/,ordinal:function(a){return a+(1===a?"er":"")},week:{dow:1,doy:4}}),"jan._feb._mrt._apr._mai_jun._jul._aug._sep._okt._nov._des.".split("_")),Rf="jan_feb_mrt_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),Sf=(uf.defineLocale("fy",{months:"jannewaris_febrewaris_maart_april_maaie_juny_july_augustus_septimber_oktober_novimber_desimber".split("_"),monthsShort:function(a,b){return/-MMM-/.test(b)?Rf[a.month()]:Qf[a.month()]},weekdays:"snein_moandei_tiisdei_woansdei_tongersdei_freed_sneon".split("_"),weekdaysShort:"si._mo._ti._wo._to._fr._so.".split("_"),weekdaysMin:"Si_Mo_Ti_Wo_To_Fr_So".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD-MM-YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},calendar:{sameDay:"[hjoed om] LT",nextDay:"[moarn om] LT",nextWeek:"dddd [om] LT",lastDay:"[juster om] LT",lastWeek:"[ôfrûne] dddd [om] LT",sameElse:"L"},relativeTime:{future:"oer %s",past:"%s lyn",s:"in pear sekonden",m:"ien minút",mm:"%d minuten",h:"ien oere",hh:"%d oeren",d:"ien dei",dd:"%d dagen",M:"ien moanne",MM:"%d moannen",y:"ien jier",yy:"%d jierren"},ordinalParse:/\d{1,2}(ste|de)/,ordinal:function(a){return a+(1===a||8===a||a>=20?"ste":"de")},week:{dow:1,doy:4}}),uf.defineLocale("gl",{months:"Xaneiro_Febreiro_Marzo_Abril_Maio_Xuño_Xullo_Agosto_Setembro_Outubro_Novembro_Decembro".split("_"),monthsShort:"Xan._Feb._Mar._Abr._Mai._Xuñ._Xul._Ago._Set._Out._Nov._Dec.".split("_"),weekdays:"Domingo_Luns_Martes_Mércores_Xoves_Venres_Sábado".split("_"),weekdaysShort:"Dom._Lun._Mar._Mér._Xov._Ven._Sáb.".split("_"),weekdaysMin:"Do_Lu_Ma_Mé_Xo_Ve_Sá".split("_"),longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY H:mm",LLLL:"dddd D MMMM YYYY H:mm"},calendar:{sameDay:function(){return"[hoxe "+(1!==this.hours()?"ás":"á")+"] LT"},nextDay:function(){return"[mañá "+(1!==this.hours()?"ás":"á")+"] LT"},nextWeek:function(){return"dddd ["+(1!==this.hours()?"ás":"a")+"] LT"},lastDay:function(){return"[onte "+(1!==this.hours()?"á":"a")+"] LT"},lastWeek:function(){return"[o] dddd [pasado "+(1!==this.hours()?"ás":"a")+"] LT"},sameElse:"L"},relativeTime:{future:function(a){return"uns segundos"===a?"nuns segundos":"en "+a},past:"hai %s",s:"uns segundos",m:"un minuto",mm:"%d minutos",h:"unha hora",hh:"%d horas",d:"un día",dd:"%d días",M:"un mes",MM:"%d meses",y:"un ano",yy:"%d anos"},ordinalParse:/\d{1,2}º/,ordinal:"%dº",week:{dow:1,doy:7}}),uf.defineLocale("he",{months:"ינואר_פברואר_מרץ_אפריל_מאי_יוני_יולי_אוגוסט_ספטמבר_אוקטובר_נובמבר_דצמבר".split("_"),monthsShort:"ינו׳_פבר׳_מרץ_אפר׳_מאי_יוני_יולי_אוג׳_ספט׳_אוק׳_נוב׳_דצמ׳".split("_"),weekdays:"ראשון_שני_שלישי_רביעי_חמישי_שישי_שבת".split("_"),weekdaysShort:"א׳_ב׳_ג׳_ד׳_ה׳_ו׳_ש׳".split("_"),weekdaysMin:"א_ב_ג_ד_ה_ו_ש".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D [ב]MMMM YYYY",LLL:"D [ב]MMMM YYYY HH:mm",LLLL:"dddd, D [ב]MMMM YYYY HH:mm",l:"D/M/YYYY",ll:"D MMM YYYY",lll:"D MMM YYYY HH:mm",llll:"ddd, D MMM YYYY HH:mm"},calendar:{sameDay:"[היום ב־]LT",nextDay:"[מחר ב־]LT",nextWeek:"dddd [בשעה] LT",lastDay:"[אתמול ב־]LT",lastWeek:"[ביום] dddd [האחרון בשעה] LT",sameElse:"L"},relativeTime:{future:"בעוד %s",past:"לפני %s",s:"מספר שניות",m:"דקה",mm:"%d דקות",h:"שעה",hh:function(a){return 2===a?"שעתיים":a+" שעות"},d:"יום",dd:function(a){return 2===a?"יומיים":a+" ימים"},M:"חודש",MM:function(a){return 2===a?"חודשיים":a+" חודשים"},y:"שנה",yy:function(a){return 2===a?"שנתיים":a%10===0&&10!==a?a+" שנה":a+" שנים"}}}),{1:"१",2:"२",3:"३",4:"४",5:"५",6:"६",7:"७",8:"८",9:"९",0:"०"}),Tf={"१":"1","२":"2","३":"3","४":"4","५":"5","६":"6","७":"7","८":"8","९":"9","०":"0"},Uf=(uf.defineLocale("hi",{months:"जनवरी_फ़रवरी_मार्च_अप्रैल_मई_जून_जुलाई_अगस्त_सितम्बर_अक्टूबर_नवम्बर_दिसम्बर".split("_"),monthsShort:"जन._फ़र._मार्च_अप्रै._मई_जून_जुल._अग._सित._अक्टू._नव._दिस.".split("_"),weekdays:"रविवार_सोमवार_मंगलवार_बुधवार_गुरूवार_शुक्रवार_शनिवार".split("_"),weekdaysShort:"रवि_सोम_मंगल_बुध_गुरू_शुक्र_शनि".split("_"),weekdaysMin:"र_सो_मं_बु_गु_शु_श".split("_"),longDateFormat:{LT:"A h:mm बजे",LTS:"A h:mm:ss बजे",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY, A h:mm बजे",LLLL:"dddd, D MMMM YYYY, A h:mm बजे"},calendar:{sameDay:"[आज] LT",nextDay:"[कल] LT",nextWeek:"dddd, LT",lastDay:"[कल] LT",lastWeek:"[पिछले] dddd, LT",sameElse:"L"},relativeTime:{future:"%s में",past:"%s पहले",s:"कुछ ही क्षण",m:"एक मिनट",mm:"%d मिनट",h:"एक घंटा",hh:"%d घंटे",d:"एक दिन",dd:"%d दिन",M:"एक महीने",MM:"%d महीने",y:"एक वर्ष",yy:"%d वर्ष"},preparse:function(a){return a.replace(/[१२३४५६७८९०]/g,function(a){return Tf[a]})},postformat:function(a){return a.replace(/\d/g,function(a){return Sf[a]})},meridiemParse:/रात|सुबह|दोपहर|शाम/,meridiemHour:function(a,b){return 12===a&&(a=0),"रात"===b?4>a?a:a+12:"सुबह"===b?a:"दोपहर"===b?a>=10?a:a+12:"शाम"===b?a+12:void 0},meridiem:function(a,b,c){return 4>a?"रात":10>a?"सुबह":17>a?"दोपहर":20>a?"शाम":"रात"},week:{dow:0,doy:6}}),uf.defineLocale("hr",{months:"siječanj_veljača_ožujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac".split("_"),monthsShort:"sij._velj._ožu._tra._svi._lip._srp._kol._ruj._lis._stu._pro.".split("_"),weekdays:"nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota".split("_"),weekdaysShort:"ned._pon._uto._sri._čet._pet._sub.".split("_"),weekdaysMin:"ne_po_ut_sr_če_pe_su".split("_"),longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"DD. MM. YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm"},calendar:{sameDay:"[danas u] LT",nextDay:"[sutra u] LT",nextWeek:function(){switch(this.day()){case 0:return"[u] [nedjelju] [u] LT";case 3:return"[u] [srijedu] [u] LT";case 6:return"[u] [subotu] [u] LT";case 1:case 2:case 4:case 5:return"[u] dddd [u] LT"}},lastDay:"[jučer u] LT",lastWeek:function(){switch(this.day()){case 0:case 3:return"[prošlu] dddd [u] LT";case 6:return"[prošle] [subote] [u] LT";case 1:case 2:case 4:case 5:return"[prošli] dddd [u] LT"}},sameElse:"L"},relativeTime:{future:"za %s",past:"prije %s",s:"par sekundi",m:Yc,mm:Yc,h:Yc,hh:Yc,d:"dan",dd:Yc,M:"mjesec",MM:Yc,y:"godinu",yy:Yc},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:7}}),"vasárnap hétfőn kedden szerdán csütörtökön pénteken szombaton".split(" ")),Vf=(uf.defineLocale("hu",{months:"január_február_március_április_május_június_július_augusztus_szeptember_október_november_december".split("_"),monthsShort:"jan_feb_márc_ápr_máj_jún_júl_aug_szept_okt_nov_dec".split("_"),weekdays:"vasárnap_hétfő_kedd_szerda_csütörtök_péntek_szombat".split("_"),weekdaysShort:"vas_hét_kedd_sze_csüt_pén_szo".split("_"),weekdaysMin:"v_h_k_sze_cs_p_szo".split("_"),longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"YYYY.MM.DD.",LL:"YYYY. MMMM D.",LLL:"YYYY. MMMM D. H:mm",LLLL:"YYYY. MMMM D., dddd H:mm"},meridiemParse:/de|du/i,isPM:function(a){return"u"===a.charAt(1).toLowerCase()},meridiem:function(a,b,c){return 12>a?c===!0?"de":"DE":c===!0?"du":"DU"},calendar:{sameDay:"[ma] LT[-kor]",nextDay:"[holnap] LT[-kor]",nextWeek:function(){return $c.call(this,!0)},lastDay:"[tegnap] LT[-kor]",lastWeek:function(){return $c.call(this,!1)},sameElse:"L"},relativeTime:{future:"%s múlva",past:"%s",s:Zc,m:Zc,mm:Zc,h:Zc,hh:Zc,d:Zc,dd:Zc,M:Zc,MM:Zc,y:Zc,yy:Zc},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:7}}),uf.defineLocale("hy-am",{months:_c,monthsShort:ad,weekdays:bd,weekdaysShort:"կրկ_երկ_երք_չրք_հնգ_ուրբ_շբթ".split("_"),weekdaysMin:"կրկ_երկ_երք_չրք_հնգ_ուրբ_շբթ".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY թ.",LLL:"D MMMM YYYY թ., HH:mm",LLLL:"dddd, D MMMM YYYY թ., HH:mm"},calendar:{sameDay:"[այսօր] LT",nextDay:"[վաղը] LT",lastDay:"[երեկ] LT",nextWeek:function(){return"dddd [օրը ժամը] LT"},lastWeek:function(){return"[անցած] dddd [օրը ժամը] LT"},sameElse:"L"},relativeTime:{future:"%s հետո",past:"%s առաջ",s:"մի քանի վայրկյան",m:"րոպե",mm:"%d րոպե",h:"ժամ",hh:"%d ժամ",d:"օր",dd:"%d օր",M:"ամիս",MM:"%d ամիս",y:"տարի",yy:"%d տարի"},meridiemParse:/գիշերվա|առավոտվա|ցերեկվա|երեկոյան/,isPM:function(a){return/^(ցերեկվա|երեկոյան)$/.test(a)},meridiem:function(a){return 4>a?"գիշերվա":12>a?"առավոտվա":17>a?"ցերեկվա":"երեկոյան"},ordinalParse:/\d{1,2}|\d{1,2}-(ին|րդ)/,ordinal:function(a,b){switch(b){case"DDD":case"w":case"W":case"DDDo":return 1===a?a+"-ին":a+"-րդ";default:return a}},week:{dow:1,doy:7}}),uf.defineLocale("id",{months:"Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_November_Desember".split("_"),monthsShort:"Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nov_Des".split("_"),weekdays:"Minggu_Senin_Selasa_Rabu_Kamis_Jumat_Sabtu".split("_"),weekdaysShort:"Min_Sen_Sel_Rab_Kam_Jum_Sab".split("_"),weekdaysMin:"Mg_Sn_Sl_Rb_Km_Jm_Sb".split("_"),longDateFormat:{LT:"HH.mm",LTS:"HH.mm.ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY [pukul] HH.mm",LLLL:"dddd, D MMMM YYYY [pukul] HH.mm"},meridiemParse:/pagi|siang|sore|malam/,meridiemHour:function(a,b){return 12===a&&(a=0),"pagi"===b?a:"siang"===b?a>=11?a:a+12:"sore"===b||"malam"===b?a+12:void 0},meridiem:function(a,b,c){return 11>a?"pagi":15>a?"siang":19>a?"sore":"malam"},calendar:{sameDay:"[Hari ini pukul] LT",nextDay:"[Besok pukul] LT",nextWeek:"dddd [pukul] LT",lastDay:"[Kemarin pukul] LT",lastWeek:"dddd [lalu pukul] LT",sameElse:"L"},relativeTime:{future:"dalam %s",past:"%s yang lalu",s:"beberapa detik",m:"semenit",mm:"%d menit",h:"sejam",hh:"%d jam",d:"sehari",dd:"%d hari",M:"sebulan",MM:"%d bulan",y:"setahun",yy:"%d tahun"},week:{dow:1,doy:7}}),uf.defineLocale("is",{months:"janúar_febrúar_mars_apríl_maí_júní_júlí_ágúst_september_október_nóvember_desember".split("_"),monthsShort:"jan_feb_mar_apr_maí_jún_júl_ágú_sep_okt_nóv_des".split("_"),weekdays:"sunnudagur_mánudagur_þriðjudagur_miðvikudagur_fimmtudagur_föstudagur_laugardagur".split("_"),weekdaysShort:"sun_mán_þri_mið_fim_fös_lau".split("_"),weekdaysMin:"Su_Má_Þr_Mi_Fi_Fö_La".split("_"),longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY [kl.] H:mm",LLLL:"dddd, D. MMMM YYYY [kl.] H:mm"},calendar:{sameDay:"[í dag kl.] LT",nextDay:"[á morgun kl.] LT",nextWeek:"dddd [kl.] LT",lastDay:"[í gær kl.] LT",lastWeek:"[síðasta] dddd [kl.] LT",sameElse:"L"},relativeTime:{future:"eftir %s",past:"fyrir %s síðan",s:dd,m:dd,mm:dd,h:"klukkustund",hh:dd,d:dd,dd:dd,M:dd,MM:dd,y:dd,yy:dd},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),uf.defineLocale("it",{months:"gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre".split("_"),monthsShort:"gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic".split("_"),weekdays:"Domenica_Lunedì_Martedì_Mercoledì_Giovedì_Venerdì_Sabato".split("_"),weekdaysShort:"Dom_Lun_Mar_Mer_Gio_Ven_Sab".split("_"),weekdaysMin:"D_L_Ma_Me_G_V_S".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"},calendar:{sameDay:"[Oggi alle] LT",nextDay:"[Domani alle] LT",nextWeek:"dddd [alle] LT",lastDay:"[Ieri alle] LT",lastWeek:function(){switch(this.day()){case 0:return"[la scorsa] dddd [alle] LT";default:return"[lo scorso] dddd [alle] LT"}},sameElse:"L"},relativeTime:{future:function(a){return(/^[0-9].+$/.test(a)?"tra":"in")+" "+a},past:"%s fa",s:"alcuni secondi",m:"un minuto",mm:"%d minuti",h:"un'ora",hh:"%d ore",d:"un giorno",dd:"%d giorni",M:"un mese",MM:"%d mesi",y:"un anno",yy:"%d anni"},ordinalParse:/\d{1,2}º/,ordinal:"%dº",week:{dow:1,doy:4}}),uf.defineLocale("ja",{months:"1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),monthsShort:"1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),weekdays:"日曜日_月曜日_火曜日_水曜日_木曜日_金曜日_土曜日".split("_"),weekdaysShort:"日_月_火_水_木_金_土".split("_"),weekdaysMin:"日_月_火_水_木_金_土".split("_"),longDateFormat:{LT:"Ah時m分",LTS:"Ah時m分s秒",L:"YYYY/MM/DD",LL:"YYYY年M月D日",LLL:"YYYY年M月D日Ah時m分",LLLL:"YYYY年M月D日Ah時m分 dddd"},meridiemParse:/午前|午後/i,isPM:function(a){return"午後"===a},meridiem:function(a,b,c){return 12>a?"午前":"午後"},calendar:{sameDay:"[今日] LT",nextDay:"[明日] LT",nextWeek:"[来週]dddd LT",lastDay:"[昨日] LT",lastWeek:"[前週]dddd LT",sameElse:"L"},relativeTime:{future:"%s後",past:"%s前",s:"数秒",m:"1分",mm:"%d分",h:"1時間",hh:"%d時間",d:"1日",dd:"%d日",M:"1ヶ月",MM:"%dヶ月",y:"1年",yy:"%d年"}}),uf.defineLocale("jv",{months:"Januari_Februari_Maret_April_Mei_Juni_Juli_Agustus_September_Oktober_Nopember_Desember".split("_"),monthsShort:"Jan_Feb_Mar_Apr_Mei_Jun_Jul_Ags_Sep_Okt_Nop_Des".split("_"),weekdays:"Minggu_Senen_Seloso_Rebu_Kemis_Jemuwah_Septu".split("_"),weekdaysShort:"Min_Sen_Sel_Reb_Kem_Jem_Sep".split("_"),weekdaysMin:"Mg_Sn_Sl_Rb_Km_Jm_Sp".split("_"),longDateFormat:{LT:"HH.mm",LTS:"HH.mm.ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY [pukul] HH.mm",LLLL:"dddd, D MMMM YYYY [pukul] HH.mm"},meridiemParse:/enjing|siyang|sonten|ndalu/,meridiemHour:function(a,b){return 12===a&&(a=0),"enjing"===b?a:"siyang"===b?a>=11?a:a+12:"sonten"===b||"ndalu"===b?a+12:void 0},meridiem:function(a,b,c){return 11>a?"enjing":15>a?"siyang":19>a?"sonten":"ndalu"},calendar:{sameDay:"[Dinten puniko pukul] LT",nextDay:"[Mbenjang pukul] LT",nextWeek:"dddd [pukul] LT",lastDay:"[Kala wingi pukul] LT",lastWeek:"dddd [kepengker pukul] LT",sameElse:"L"},relativeTime:{future:"wonten ing %s",past:"%s ingkang kepengker",s:"sawetawis detik",m:"setunggal menit",mm:"%d menit",h:"setunggal jam",hh:"%d jam",d:"sedinten",dd:"%d dinten",M:"sewulan",MM:"%d wulan",y:"setaun",yy:"%d taun"},week:{dow:1,doy:7}}),uf.defineLocale("ka",{months:ed,monthsShort:"იან_თებ_მარ_აპრ_მაი_ივნ_ივლ_აგვ_სექ_ოქტ_ნოე_დეკ".split("_"),weekdays:fd,weekdaysShort:"კვი_ორშ_სამ_ოთხ_ხუთ_პარ_შაბ".split("_"),weekdaysMin:"კვ_ორ_სა_ოთ_ხუ_პა_შა".split("_"),longDateFormat:{LT:"h:mm A",LTS:"h:mm:ss A",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY h:mm A",LLLL:"dddd, D MMMM YYYY h:mm A"},calendar:{sameDay:"[დღეს] LT[-ზე]",nextDay:"[ხვალ] LT[-ზე]",lastDay:"[გუშინ] LT[-ზე]",nextWeek:"[შემდეგ] dddd LT[-ზე]",lastWeek:"[წინა] dddd LT-ზე",sameElse:"L"},relativeTime:{future:function(a){return/(წამი|წუთი|საათი|წელი)/.test(a)?a.replace(/ი$/,"ში"):a+"ში"},past:function(a){return/(წამი|წუთი|საათი|დღე|თვე)/.test(a)?a.replace(/(ი|ე)$/,"ის წინ"):/წელი/.test(a)?a.replace(/წელი$/,"წლის წინ"):void 0},s:"რამდენიმე წამი",m:"წუთი",mm:"%d წუთი",h:"საათი",hh:"%d საათი",d:"დღე",dd:"%d დღე",M:"თვე",MM:"%d თვე",y:"წელი",yy:"%d წელი"},ordinalParse:/0|1-ლი|მე-\d{1,2}|\d{1,2}-ე/,ordinal:function(a){return 0===a?a:1===a?a+"-ლი":20>a||100>=a&&a%20===0||a%100===0?"მე-"+a:a+"-ე"},week:{dow:1,doy:7}}),uf.defineLocale("km",{months:"មករា_កុម្ភៈ_មិនា_មេសា_ឧសភា_មិថុនា_កក្កដា_សីហា_កញ្ញា_តុលា_វិច្ឆិកា_ធ្នូ".split("_"),monthsShort:"មករា_កុម្ភៈ_មិនា_មេសា_ឧសភា_មិថុនា_កក្កដា_សីហា_កញ្ញា_តុលា_វិច្ឆិកា_ធ្នូ".split("_"),weekdays:"អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ_សៅរ៍".split("_"),weekdaysShort:"អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ_សៅរ៍".split("_"),weekdaysMin:"អាទិត្យ_ច័ន្ទ_អង្គារ_ពុធ_ព្រហស្បតិ៍_សុក្រ_សៅរ៍".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"},calendar:{sameDay:"[ថ្ងៃនៈ ម៉ោង] LT",nextDay:"[ស្អែក ម៉ោង] LT",nextWeek:"dddd [ម៉ោង] LT",lastDay:"[ម្សិលមិញ ម៉ោង] LT",lastWeek:"dddd [សប្តាហ៍មុន] [ម៉ោង] LT",sameElse:"L"},relativeTime:{future:"%sទៀត",past:"%sមុន",s:"ប៉ុន្មានវិនាទី",m:"មួយនាទី",mm:"%d នាទី",h:"មួយម៉ោង",hh:"%d ម៉ោង",d:"មួយថ្ងៃ",dd:"%d ថ្ងៃ",M:"មួយខែ",MM:"%d ខែ",y:"មួយឆ្នាំ",yy:"%d ឆ្នាំ"},week:{dow:1,doy:4}}),uf.defineLocale("ko",{months:"1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월".split("_"),monthsShort:"1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월".split("_"),weekdays:"일요일_월요일_화요일_수요일_목요일_금요일_토요일".split("_"),weekdaysShort:"일_월_화_수_목_금_토".split("_"),weekdaysMin:"일_월_화_수_목_금_토".split("_"),longDateFormat:{LT:"A h시 m분",LTS:"A h시 m분 s초",L:"YYYY.MM.DD",LL:"YYYY년 MMMM D일",LLL:"YYYY년 MMMM D일 A h시 m분",LLLL:"YYYY년 MMMM D일 dddd A h시 m분"},calendar:{sameDay:"오늘 LT",nextDay:"내일 LT",nextWeek:"dddd LT",lastDay:"어제 LT",lastWeek:"지난주 dddd LT",sameElse:"L"},relativeTime:{future:"%s 후",past:"%s 전",s:"몇초",ss:"%d초",m:"일분",mm:"%d분",h:"한시간",hh:"%d시간",d:"하루",dd:"%d일",M:"한달",MM:"%d달",y:"일년",yy:"%d년"},ordinalParse:/\d{1,2}일/,ordinal:"%d일",meridiemParse:/오전|오후/,isPM:function(a){return"오후"===a},meridiem:function(a,b,c){return 12>a?"오전":"오후"}}),uf.defineLocale("lb",{months:"Januar_Februar_Mäerz_Abrëll_Mee_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),monthsShort:"Jan._Febr._Mrz._Abr._Mee_Jun._Jul._Aug._Sept._Okt._Nov._Dez.".split("_"),weekdays:"Sonndeg_Méindeg_Dënschdeg_Mëttwoch_Donneschdeg_Freideg_Samschdeg".split("_"),weekdaysShort:"So._Mé._Dë._Më._Do._Fr._Sa.".split("_"),weekdaysMin:"So_Mé_Dë_Më_Do_Fr_Sa".split("_"),longDateFormat:{LT:"H:mm [Auer]",LTS:"H:mm:ss [Auer]",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm [Auer]",LLLL:"dddd, D. MMMM YYYY H:mm [Auer]"},calendar:{sameDay:"[Haut um] LT",sameElse:"L",nextDay:"[Muer um] LT",nextWeek:"dddd [um] LT",lastDay:"[Gëschter um] LT",lastWeek:function(){switch(this.day()){case 2:case 4:return"[Leschten] dddd [um] LT";default:return"[Leschte] dddd [um] LT"}}},relativeTime:{future:hd,past:id,s:"e puer Sekonnen",m:gd,mm:"%d Minutten",h:gd,hh:"%d Stonnen",d:gd,dd:"%d Deeg",M:gd,MM:"%d Méint",y:gd,yy:"%d Joer"},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),{m:"minutė_minutės_minutę",mm:"minutės_minučių_minutes",h:"valanda_valandos_valandą",hh:"valandos_valandų_valandas",d:"diena_dienos_dieną",dd:"dienos_dienų_dienas",M:"mėnuo_mėnesio_mėnesį",MM:"mėnesiai_mėnesių_mėnesius",y:"metai_metų_metus",yy:"metai_metų_metus"}),Wf="sekmadienis_pirmadienis_antradienis_trečiadienis_ketvirtadienis_penktadienis_šeštadienis".split("_"),Xf=(uf.defineLocale("lt",{months:ld,monthsShort:"sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd".split("_"),weekdays:qd,weekdaysShort:"Sek_Pir_Ant_Tre_Ket_Pen_Šeš".split("_"),weekdaysMin:"S_P_A_T_K_Pn_Š".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY-MM-DD",LL:"YYYY [m.] MMMM D [d.]",LLL:"YYYY [m.] MMMM D [d.], HH:mm [val.]",LLLL:"YYYY [m.] MMMM D [d.], dddd, HH:mm [val.]",l:"YYYY-MM-DD",ll:"YYYY [m.] MMMM D [d.]",lll:"YYYY [m.] MMMM D [d.], HH:mm [val.]",llll:"YYYY [m.] MMMM D [d.], ddd, HH:mm [val.]"},calendar:{sameDay:"[Šiandien] LT",nextDay:"[Rytoj] LT",nextWeek:"dddd LT",lastDay:"[Vakar] LT",lastWeek:"[Praėjusį] dddd LT",sameElse:"L"},relativeTime:{future:"po %s",past:"prieš %s",s:kd,m:md,mm:pd,h:md,hh:pd,d:md,dd:pd,M:md,MM:pd,y:md,yy:pd},ordinalParse:/\d{1,2}-oji/,ordinal:function(a){return a+"-oji"},week:{dow:1,doy:4}}),{m:"minūtes_minūtēm_minūte_minūtes".split("_"),mm:"minūtes_minūtēm_minūte_minūtes".split("_"),h:"stundas_stundām_stunda_stundas".split("_"),hh:"stundas_stundām_stunda_stundas".split("_"),d:"dienas_dienām_diena_dienas".split("_"),dd:"dienas_dienām_diena_dienas".split("_"),M:"mēneša_mēnešiem_mēnesis_mēneši".split("_"),MM:"mēneša_mēnešiem_mēnesis_mēneši".split("_"),y:"gada_gadiem_gads_gadi".split("_"),yy:"gada_gadiem_gads_gadi".split("_")}),Yf=(uf.defineLocale("lv",{months:"janvāris_februāris_marts_aprīlis_maijs_jūnijs_jūlijs_augusts_septembris_oktobris_novembris_decembris".split("_"),monthsShort:"jan_feb_mar_apr_mai_jūn_jūl_aug_sep_okt_nov_dec".split("_"),weekdays:"svētdiena_pirmdiena_otrdiena_trešdiena_ceturtdiena_piektdiena_sestdiena".split("_"),weekdaysShort:"Sv_P_O_T_C_Pk_S".split("_"),weekdaysMin:"Sv_P_O_T_C_Pk_S".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY.",LL:"YYYY. [gada] D. MMMM",LLL:"YYYY. [gada] D. MMMM, HH:mm",LLLL:"YYYY. [gada] D. MMMM, dddd, HH:mm"},calendar:{sameDay:"[Šodien pulksten] LT",nextDay:"[Rīt pulksten] LT",nextWeek:"dddd [pulksten] LT",lastDay:"[Vakar pulksten] LT",lastWeek:"[Pagājušā] dddd [pulksten] LT",sameElse:"L"},relativeTime:{future:"pēc %s",past:"pirms %s",s:ud,m:td,mm:sd,h:td,hh:sd,d:td,dd:sd,M:td,MM:sd,y:td,yy:sd},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),{words:{m:["jedan minut","jednog minuta"],mm:["minut","minuta","minuta"],h:["jedan sat","jednog sata"],hh:["sat","sata","sati"],dd:["dan","dana","dana"],MM:["mjesec","mjeseca","mjeseci"],yy:["godina","godine","godina"]},correctGrammaticalCase:function(a,b){return 1===a?b[0]:a>=2&&4>=a?b[1]:b[2]},translate:function(a,b,c){var d=Yf.words[c];return 1===c.length?b?d[0]:d[1]:a+" "+Yf.correctGrammaticalCase(a,d)}}),Zf=(uf.defineLocale("me",{months:["januar","februar","mart","april","maj","jun","jul","avgust","septembar","oktobar","novembar","decembar"],monthsShort:["jan.","feb.","mar.","apr.","maj","jun","jul","avg.","sep.","okt.","nov.","dec."],weekdays:["nedjelja","ponedjeljak","utorak","srijeda","četvrtak","petak","subota"],weekdaysShort:["ned.","pon.","uto.","sri.","čet.","pet.","sub."],weekdaysMin:["ne","po","ut","sr","če","pe","su"],longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"DD. MM. YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm"},calendar:{sameDay:"[danas u] LT",nextDay:"[sjutra u] LT",nextWeek:function(){switch(this.day()){case 0:return"[u] [nedjelju] [u] LT";case 3:return"[u] [srijedu] [u] LT";case 6:return"[u] [subotu] [u] LT";case 1:case 2:case 4:case 5:return"[u] dddd [u] LT"}},lastDay:"[juče u] LT",lastWeek:function(){var a=["[prošle] [nedjelje] [u] LT","[prošlog] [ponedjeljka] [u] LT","[prošlog] [utorka] [u] LT","[prošle] [srijede] [u] LT","[prošlog] [četvrtka] [u] LT","[prošlog] [petka] [u] LT","[prošle] [subote] [u] LT"];return a[this.day()]},sameElse:"L"},relativeTime:{future:"za %s",past:"prije %s",s:"nekoliko sekundi",m:Yf.translate,mm:Yf.translate,h:Yf.translate,hh:Yf.translate,d:"dan",dd:Yf.translate,M:"mjesec",MM:Yf.translate,y:"godinu",yy:Yf.translate},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:7}}),uf.defineLocale("mk",{months:"јануари_февруари_март_април_мај_јуни_јули_август_септември_октомври_ноември_декември".split("_"),monthsShort:"јан_фев_мар_апр_мај_јун_јул_авг_сеп_окт_ное_дек".split("_"),weekdays:"недела_понеделник_вторник_среда_четврток_петок_сабота".split("_"),weekdaysShort:"нед_пон_вто_сре_чет_пет_саб".split("_"),weekdaysMin:"нe_пo_вт_ср_че_пе_сa".split("_"),longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"D.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY H:mm",LLLL:"dddd, D MMMM YYYY H:mm"},calendar:{sameDay:"[Денес во] LT",nextDay:"[Утре во] LT",nextWeek:"dddd [во] LT",lastDay:"[Вчера во] LT",lastWeek:function(){switch(this.day()){case 0:case 3:case 6:return"[Во изминатата] dddd [во] LT";case 1:case 2:case 4:case 5:return"[Во изминатиот] dddd [во] LT"}},sameElse:"L"},relativeTime:{future:"после %s",past:"пред %s",s:"неколку секунди",m:"минута",mm:"%d минути",h:"час",hh:"%d часа",d:"ден",dd:"%d дена",M:"месец",MM:"%d месеци",y:"година",yy:"%d години"},ordinalParse:/\d{1,2}-(ев|ен|ти|ви|ри|ми)/,ordinal:function(a){var b=a%10,c=a%100;return 0===a?a+"-ев":0===c?a+"-ен":c>10&&20>c?a+"-ти":1===b?a+"-ви":2===b?a+"-ри":7===b||8===b?a+"-ми":a+"-ти"},week:{dow:1,doy:7}}),uf.defineLocale("ml",{months:"ജനുവരി_ഫെബ്രുവരി_മാർച്ച്_ഏപ്രിൽ_മേയ്_ജൂൺ_ജൂലൈ_ഓഗസ്റ്റ്_സെപ്റ്റംബർ_ഒക്ടോബർ_നവംബർ_ഡിസംബർ".split("_"),monthsShort:"ജനു._ഫെബ്രു._മാർ._ഏപ്രി._മേയ്_ജൂൺ_ജൂലൈ._ഓഗ._സെപ്റ്റ._ഒക്ടോ._നവം._ഡിസം.".split("_"),weekdays:"ഞായറാഴ്ച_തിങ്കളാഴ്ച_ചൊവ്വാഴ്ച_ബുധനാഴ്ച_വ്യാഴാഴ്ച_വെള്ളിയാഴ്ച_ശനിയാഴ്ച".split("_"),weekdaysShort:"ഞായർ_തിങ്കൾ_ചൊവ്വ_ബുധൻ_വ്യാഴം_വെള്ളി_ശനി".split("_"),weekdaysMin:"ഞാ_തി_ചൊ_ബു_വ്യാ_വെ_ശ".split("_"),longDateFormat:{LT:"A h:mm -നു",LTS:"A h:mm:ss -നു",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY, A h:mm -നു",LLLL:"dddd, D MMMM YYYY, A h:mm -നു"},calendar:{sameDay:"[ഇന്ന്] LT",nextDay:"[നാളെ] LT",nextWeek:"dddd, LT",lastDay:"[ഇന്നലെ] LT",lastWeek:"[കഴിഞ്ഞ] dddd, LT",sameElse:"L"},relativeTime:{future:"%s കഴിഞ്ഞ്",past:"%s മുൻപ്",s:"അൽപ നിമിഷങ്ങൾ",m:"ഒരു മിനിറ്റ്",mm:"%d മിനിറ്റ്",h:"ഒരു മണിക്കൂർ",hh:"%d മണിക്കൂർ",d:"ഒരു ദിവസം",dd:"%d ദിവസം",M:"ഒരു മാസം",MM:"%d മാസം",y:"ഒരു വർഷം",yy:"%d വർഷം"},meridiemParse:/രാത്രി|രാവിലെ|ഉച്ച കഴിഞ്ഞ്|വൈകുന്നേരം|രാത്രി/i,isPM:function(a){return/^(ഉച്ച കഴിഞ്ഞ്|വൈകുന്നേരം|രാത്രി)$/.test(a)},meridiem:function(a,b,c){return 4>a?"രാത്രി":12>a?"രാവിലെ":17>a?"ഉച്ച കഴിഞ്ഞ്":20>a?"വൈകുന്നേരം":"രാത്രി"}}),{1:"१",2:"२",3:"३",4:"४",5:"५",6:"६",7:"७",8:"८",9:"९",0:"०"}),$f={"१":"1","२":"2","३":"3","४":"4","५":"5","६":"6","७":"7","८":"8","९":"9","०":"0"},_f=(uf.defineLocale("mr",{months:"जानेवारी_फेब्रुवारी_मार्च_एप्रिल_मे_जून_जुलै_ऑगस्ट_सप्टेंबर_ऑक्टोबर_नोव्हेंबर_डिसेंबर".split("_"),monthsShort:"जाने._फेब्रु._मार्च._एप्रि._मे._जून._जुलै._ऑग._सप्टें._ऑक्टो._नोव्हें._डिसें.".split("_"),weekdays:"रविवार_सोमवार_मंगळवार_बुधवार_गुरूवार_शुक्रवार_शनिवार".split("_"),weekdaysShort:"रवि_सोम_मंगळ_बुध_गुरू_शुक्र_शनि".split("_"),weekdaysMin:"र_सो_मं_बु_गु_शु_श".split("_"),longDateFormat:{LT:"A h:mm वाजता",LTS:"A h:mm:ss वाजता",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY, A h:mm वाजता",LLLL:"dddd, D MMMM YYYY, A h:mm वाजता"},calendar:{sameDay:"[आज] LT",nextDay:"[उद्या] LT",nextWeek:"dddd, LT",lastDay:"[काल] LT",lastWeek:"[मागील] dddd, LT",sameElse:"L"},relativeTime:{future:"%s नंतर",past:"%s पूर्वी",s:"सेकंद",m:"एक मिनिट",mm:"%d मिनिटे",h:"एक तास",hh:"%d तास",d:"एक दिवस",dd:"%d दिवस",M:"एक महिना",MM:"%d महिने",y:"एक वर्ष",yy:"%d वर्षे"},preparse:function(a){return a.replace(/[१२३४५६७८९०]/g,function(a){return $f[a]})},postformat:function(a){return a.replace(/\d/g,function(a){return Zf[a]})},meridiemParse:/रात्री|सकाळी|दुपारी|सायंकाळी/,meridiemHour:function(a,b){return 12===a&&(a=0),"रात्री"===b?4>a?a:a+12:"सकाळी"===b?a:"दुपारी"===b?a>=10?a:a+12:"सायंकाळी"===b?a+12:void 0},meridiem:function(a,b,c){return 4>a?"रात्री":10>a?"सकाळी":17>a?"दुपारी":20>a?"सायंकाळी":"रात्री"},week:{dow:0,doy:6}}),uf.defineLocale("ms-my",{months:"Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember".split("_"),monthsShort:"Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis".split("_"),weekdays:"Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu".split("_"),weekdaysShort:"Ahd_Isn_Sel_Rab_Kha_Jum_Sab".split("_"),weekdaysMin:"Ah_Is_Sl_Rb_Km_Jm_Sb".split("_"),longDateFormat:{LT:"HH.mm",LTS:"HH.mm.ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY [pukul] HH.mm",LLLL:"dddd, D MMMM YYYY [pukul] HH.mm"},meridiemParse:/pagi|tengahari|petang|malam/,meridiemHour:function(a,b){return 12===a&&(a=0),"pagi"===b?a:"tengahari"===b?a>=11?a:a+12:"petang"===b||"malam"===b?a+12:void 0},meridiem:function(a,b,c){return 11>a?"pagi":15>a?"tengahari":19>a?"petang":"malam"},calendar:{sameDay:"[Hari ini pukul] LT",nextDay:"[Esok pukul] LT",nextWeek:"dddd [pukul] LT",lastDay:"[Kelmarin pukul] LT",
lastWeek:"dddd [lepas pukul] LT",sameElse:"L"},relativeTime:{future:"dalam %s",past:"%s yang lepas",s:"beberapa saat",m:"seminit",mm:"%d minit",h:"sejam",hh:"%d jam",d:"sehari",dd:"%d hari",M:"sebulan",MM:"%d bulan",y:"setahun",yy:"%d tahun"},week:{dow:1,doy:7}}),uf.defineLocale("ms",{months:"Januari_Februari_Mac_April_Mei_Jun_Julai_Ogos_September_Oktober_November_Disember".split("_"),monthsShort:"Jan_Feb_Mac_Apr_Mei_Jun_Jul_Ogs_Sep_Okt_Nov_Dis".split("_"),weekdays:"Ahad_Isnin_Selasa_Rabu_Khamis_Jumaat_Sabtu".split("_"),weekdaysShort:"Ahd_Isn_Sel_Rab_Kha_Jum_Sab".split("_"),weekdaysMin:"Ah_Is_Sl_Rb_Km_Jm_Sb".split("_"),longDateFormat:{LT:"HH.mm",LTS:"HH.mm.ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY [pukul] HH.mm",LLLL:"dddd, D MMMM YYYY [pukul] HH.mm"},meridiemParse:/pagi|tengahari|petang|malam/,meridiemHour:function(a,b){return 12===a&&(a=0),"pagi"===b?a:"tengahari"===b?a>=11?a:a+12:"petang"===b||"malam"===b?a+12:void 0},meridiem:function(a,b,c){return 11>a?"pagi":15>a?"tengahari":19>a?"petang":"malam"},calendar:{sameDay:"[Hari ini pukul] LT",nextDay:"[Esok pukul] LT",nextWeek:"dddd [pukul] LT",lastDay:"[Kelmarin pukul] LT",lastWeek:"dddd [lepas pukul] LT",sameElse:"L"},relativeTime:{future:"dalam %s",past:"%s yang lepas",s:"beberapa saat",m:"seminit",mm:"%d minit",h:"sejam",hh:"%d jam",d:"sehari",dd:"%d hari",M:"sebulan",MM:"%d bulan",y:"setahun",yy:"%d tahun"},week:{dow:1,doy:7}}),{1:"၁",2:"၂",3:"၃",4:"၄",5:"၅",6:"၆",7:"၇",8:"၈",9:"၉",0:"၀"}),ag={"၁":"1","၂":"2","၃":"3","၄":"4","၅":"5","၆":"6","၇":"7","၈":"8","၉":"9","၀":"0"},bg=(uf.defineLocale("my",{months:"ဇန်နဝါရီ_ဖေဖော်ဝါရီ_မတ်_ဧပြီ_မေ_ဇွန်_ဇူလိုင်_သြဂုတ်_စက်တင်ဘာ_အောက်တိုဘာ_နိုဝင်ဘာ_ဒီဇင်ဘာ".split("_"),monthsShort:"ဇန်_ဖေ_မတ်_ပြီ_မေ_ဇွန်_လိုင်_သြ_စက်_အောက်_နို_ဒီ".split("_"),weekdays:"တနင်္ဂနွေ_တနင်္လာ_အင်္ဂါ_ဗုဒ္ဓဟူး_ကြာသပတေး_သောကြာ_စနေ".split("_"),weekdaysShort:"နွေ_လာ_ဂါ_ဟူး_ကြာ_သော_နေ".split("_"),weekdaysMin:"နွေ_လာ_ဂါ_ဟူး_ကြာ_သော_နေ".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},calendar:{sameDay:"[ယနေ.] LT [မှာ]",nextDay:"[မနက်ဖြန်] LT [မှာ]",nextWeek:"dddd LT [မှာ]",lastDay:"[မနေ.က] LT [မှာ]",lastWeek:"[ပြီးခဲ့သော] dddd LT [မှာ]",sameElse:"L"},relativeTime:{future:"လာမည့် %s မှာ",past:"လွန်ခဲ့သော %s က",s:"စက္ကန်.အနည်းငယ်",m:"တစ်မိနစ်",mm:"%d မိနစ်",h:"တစ်နာရီ",hh:"%d နာရီ",d:"တစ်ရက်",dd:"%d ရက်",M:"တစ်လ",MM:"%d လ",y:"တစ်နှစ်",yy:"%d နှစ်"},preparse:function(a){return a.replace(/[၁၂၃၄၅၆၇၈၉၀]/g,function(a){return ag[a]})},postformat:function(a){return a.replace(/\d/g,function(a){return _f[a]})},week:{dow:1,doy:4}}),uf.defineLocale("nb",{months:"januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),monthsShort:"jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),weekdays:"søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag".split("_"),weekdaysShort:"søn_man_tirs_ons_tors_fre_lør".split("_"),weekdaysMin:"sø_ma_ti_on_to_fr_lø".split("_"),longDateFormat:{LT:"H.mm",LTS:"H.mm.ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY [kl.] H.mm",LLLL:"dddd D. MMMM YYYY [kl.] H.mm"},calendar:{sameDay:"[i dag kl.] LT",nextDay:"[i morgen kl.] LT",nextWeek:"dddd [kl.] LT",lastDay:"[i går kl.] LT",lastWeek:"[forrige] dddd [kl.] LT",sameElse:"L"},relativeTime:{future:"om %s",past:"for %s siden",s:"noen sekunder",m:"ett minutt",mm:"%d minutter",h:"en time",hh:"%d timer",d:"en dag",dd:"%d dager",M:"en måned",MM:"%d måneder",y:"ett år",yy:"%d år"},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),{1:"१",2:"२",3:"३",4:"४",5:"५",6:"६",7:"७",8:"८",9:"९",0:"०"}),cg={"१":"1","२":"2","३":"3","४":"4","५":"5","६":"6","७":"7","८":"8","९":"9","०":"0"},dg=(uf.defineLocale("ne",{months:"जनवरी_फेब्रुवरी_मार्च_अप्रिल_मई_जुन_जुलाई_अगष्ट_सेप्टेम्बर_अक्टोबर_नोभेम्बर_डिसेम्बर".split("_"),monthsShort:"जन._फेब्रु._मार्च_अप्रि._मई_जुन_जुलाई._अग._सेप्ट._अक्टो._नोभे._डिसे.".split("_"),weekdays:"आइतबार_सोमबार_मङ्गलबार_बुधबार_बिहिबार_शुक्रबार_शनिबार".split("_"),weekdaysShort:"आइत._सोम._मङ्गल._बुध._बिहि._शुक्र._शनि.".split("_"),weekdaysMin:"आइ._सो._मङ्_बु._बि._शु._श.".split("_"),longDateFormat:{LT:"Aको h:mm बजे",LTS:"Aको h:mm:ss बजे",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY, Aको h:mm बजे",LLLL:"dddd, D MMMM YYYY, Aको h:mm बजे"},preparse:function(a){return a.replace(/[१२३४५६७८९०]/g,function(a){return cg[a]})},postformat:function(a){return a.replace(/\d/g,function(a){return bg[a]})},meridiemParse:/राती|बिहान|दिउँसो|बेलुका|साँझ|राती/,meridiemHour:function(a,b){return 12===a&&(a=0),"राती"===b?3>a?a:a+12:"बिहान"===b?a:"दिउँसो"===b?a>=10?a:a+12:"बेलुका"===b||"साँझ"===b?a+12:void 0},meridiem:function(a,b,c){return 3>a?"राती":10>a?"बिहान":15>a?"दिउँसो":18>a?"बेलुका":20>a?"साँझ":"राती"},calendar:{sameDay:"[आज] LT",nextDay:"[भोली] LT",nextWeek:"[आउँदो] dddd[,] LT",lastDay:"[हिजो] LT",lastWeek:"[गएको] dddd[,] LT",sameElse:"L"},relativeTime:{future:"%sमा",past:"%s अगाडी",s:"केही समय",m:"एक मिनेट",mm:"%d मिनेट",h:"एक घण्टा",hh:"%d घण्टा",d:"एक दिन",dd:"%d दिन",M:"एक महिना",MM:"%d महिना",y:"एक बर्ष",yy:"%d बर्ष"},week:{dow:1,doy:7}}),"jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.".split("_")),eg="jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec".split("_"),fg=(uf.defineLocale("nl",{months:"januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december".split("_"),monthsShort:function(a,b){return/-MMM-/.test(b)?eg[a.month()]:dg[a.month()]},weekdays:"zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag".split("_"),weekdaysShort:"zo._ma._di._wo._do._vr._za.".split("_"),weekdaysMin:"Zo_Ma_Di_Wo_Do_Vr_Za".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD-MM-YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},calendar:{sameDay:"[vandaag om] LT",nextDay:"[morgen om] LT",nextWeek:"dddd [om] LT",lastDay:"[gisteren om] LT",lastWeek:"[afgelopen] dddd [om] LT",sameElse:"L"},relativeTime:{future:"over %s",past:"%s geleden",s:"een paar seconden",m:"één minuut",mm:"%d minuten",h:"één uur",hh:"%d uur",d:"één dag",dd:"%d dagen",M:"één maand",MM:"%d maanden",y:"één jaar",yy:"%d jaar"},ordinalParse:/\d{1,2}(ste|de)/,ordinal:function(a){return a+(1===a||8===a||a>=20?"ste":"de")},week:{dow:1,doy:4}}),uf.defineLocale("nn",{months:"januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),monthsShort:"jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),weekdays:"sundag_måndag_tysdag_onsdag_torsdag_fredag_laurdag".split("_"),weekdaysShort:"sun_mån_tys_ons_tor_fre_lau".split("_"),weekdaysMin:"su_må_ty_on_to_fr_lø".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},calendar:{sameDay:"[I dag klokka] LT",nextDay:"[I morgon klokka] LT",nextWeek:"dddd [klokka] LT",lastDay:"[I går klokka] LT",lastWeek:"[Føregåande] dddd [klokka] LT",sameElse:"L"},relativeTime:{future:"om %s",past:"for %s sidan",s:"nokre sekund",m:"eit minutt",mm:"%d minutt",h:"ein time",hh:"%d timar",d:"ein dag",dd:"%d dagar",M:"ein månad",MM:"%d månader",y:"eit år",yy:"%d år"},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),"styczeń_luty_marzec_kwiecień_maj_czerwiec_lipiec_sierpień_wrzesień_październik_listopad_grudzień".split("_")),gg="stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_września_października_listopada_grudnia".split("_"),hg=(uf.defineLocale("pl",{months:function(a,b){return""===b?"("+gg[a.month()]+"|"+fg[a.month()]+")":/D MMMM/.test(b)?gg[a.month()]:fg[a.month()]},monthsShort:"sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paź_lis_gru".split("_"),weekdays:"niedziela_poniedziałek_wtorek_środa_czwartek_piątek_sobota".split("_"),weekdaysShort:"nie_pon_wt_śr_czw_pt_sb".split("_"),weekdaysMin:"N_Pn_Wt_Śr_Cz_Pt_So".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"},calendar:{sameDay:"[Dziś o] LT",nextDay:"[Jutro o] LT",nextWeek:"[W] dddd [o] LT",lastDay:"[Wczoraj o] LT",lastWeek:function(){switch(this.day()){case 0:return"[W zeszłą niedzielę o] LT";case 3:return"[W zeszłą środę o] LT";case 6:return"[W zeszłą sobotę o] LT";default:return"[W zeszły] dddd [o] LT"}},sameElse:"L"},relativeTime:{future:"za %s",past:"%s temu",s:"kilka sekund",m:wd,mm:wd,h:wd,hh:wd,d:"1 dzień",dd:"%d dni",M:"miesiąc",MM:wd,y:"rok",yy:wd},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),uf.defineLocale("pt-br",{months:"Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro".split("_"),monthsShort:"Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez".split("_"),weekdays:"Domingo_Segunda-Feira_Terça-Feira_Quarta-Feira_Quinta-Feira_Sexta-Feira_Sábado".split("_"),weekdaysShort:"Dom_Seg_Ter_Qua_Qui_Sex_Sáb".split("_"),weekdaysMin:"Dom_2ª_3ª_4ª_5ª_6ª_Sáb".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D [de] MMMM [de] YYYY",LLL:"D [de] MMMM [de] YYYY [às] HH:mm",LLLL:"dddd, D [de] MMMM [de] YYYY [às] HH:mm"},calendar:{sameDay:"[Hoje às] LT",nextDay:"[Amanhã às] LT",nextWeek:"dddd [às] LT",lastDay:"[Ontem às] LT",lastWeek:function(){return 0===this.day()||6===this.day()?"[Último] dddd [às] LT":"[Última] dddd [às] LT"},sameElse:"L"},relativeTime:{future:"em %s",past:"%s atrás",s:"poucos segundos",m:"um minuto",mm:"%d minutos",h:"uma hora",hh:"%d horas",d:"um dia",dd:"%d dias",M:"um mês",MM:"%d meses",y:"um ano",yy:"%d anos"},ordinalParse:/\d{1,2}º/,ordinal:"%dº"}),uf.defineLocale("pt",{months:"Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro".split("_"),monthsShort:"Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez".split("_"),weekdays:"Domingo_Segunda-Feira_Terça-Feira_Quarta-Feira_Quinta-Feira_Sexta-Feira_Sábado".split("_"),weekdaysShort:"Dom_Seg_Ter_Qua_Qui_Sex_Sáb".split("_"),weekdaysMin:"Dom_2ª_3ª_4ª_5ª_6ª_Sáb".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D [de] MMMM [de] YYYY",LLL:"D [de] MMMM [de] YYYY HH:mm",LLLL:"dddd, D [de] MMMM [de] YYYY HH:mm"},calendar:{sameDay:"[Hoje às] LT",nextDay:"[Amanhã às] LT",nextWeek:"dddd [às] LT",lastDay:"[Ontem às] LT",lastWeek:function(){return 0===this.day()||6===this.day()?"[Último] dddd [às] LT":"[Última] dddd [às] LT"},sameElse:"L"},relativeTime:{future:"em %s",past:"há %s",s:"segundos",m:"um minuto",mm:"%d minutos",h:"uma hora",hh:"%d horas",d:"um dia",dd:"%d dias",M:"um mês",MM:"%d meses",y:"um ano",yy:"%d anos"},ordinalParse:/\d{1,2}º/,ordinal:"%dº",week:{dow:1,doy:4}}),uf.defineLocale("ro",{months:"ianuarie_februarie_martie_aprilie_mai_iunie_iulie_august_septembrie_octombrie_noiembrie_decembrie".split("_"),monthsShort:"ian._febr._mart._apr._mai_iun._iul._aug._sept._oct._nov._dec.".split("_"),weekdays:"duminică_luni_marți_miercuri_joi_vineri_sâmbătă".split("_"),weekdaysShort:"Dum_Lun_Mar_Mie_Joi_Vin_Sâm".split("_"),weekdaysMin:"Du_Lu_Ma_Mi_Jo_Vi_Sâ".split("_"),longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY H:mm",LLLL:"dddd, D MMMM YYYY H:mm"},calendar:{sameDay:"[azi la] LT",nextDay:"[mâine la] LT",nextWeek:"dddd [la] LT",lastDay:"[ieri la] LT",lastWeek:"[fosta] dddd [la] LT",sameElse:"L"},relativeTime:{future:"peste %s",past:"%s în urmă",s:"câteva secunde",m:"un minut",mm:xd,h:"o oră",hh:xd,d:"o zi",dd:xd,M:"o lună",MM:xd,y:"un an",yy:xd},week:{dow:1,doy:7}}),uf.defineLocale("ru",{months:Ad,monthsShort:Bd,weekdays:Cd,weekdaysShort:"вс_пн_вт_ср_чт_пт_сб".split("_"),weekdaysMin:"вс_пн_вт_ср_чт_пт_сб".split("_"),monthsParse:[/^янв/i,/^фев/i,/^мар/i,/^апр/i,/^ма[й|я]/i,/^июн/i,/^июл/i,/^авг/i,/^сен/i,/^окт/i,/^ноя/i,/^дек/i],longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY г.",LLL:"D MMMM YYYY г., HH:mm",LLLL:"dddd, D MMMM YYYY г., HH:mm"},calendar:{sameDay:"[Сегодня в] LT",nextDay:"[Завтра в] LT",lastDay:"[Вчера в] LT",nextWeek:function(){return 2===this.day()?"[Во] dddd [в] LT":"[В] dddd [в] LT"},lastWeek:function(a){if(a.week()===this.week())return 2===this.day()?"[Во] dddd [в] LT":"[В] dddd [в] LT";switch(this.day()){case 0:return"[В прошлое] dddd [в] LT";case 1:case 2:case 4:return"[В прошлый] dddd [в] LT";case 3:case 5:case 6:return"[В прошлую] dddd [в] LT"}},sameElse:"L"},relativeTime:{future:"через %s",past:"%s назад",s:"несколько секунд",m:zd,mm:zd,h:"час",hh:zd,d:"день",dd:zd,M:"месяц",MM:zd,y:"год",yy:zd},meridiemParse:/ночи|утра|дня|вечера/i,isPM:function(a){return/^(дня|вечера)$/.test(a)},meridiem:function(a,b,c){return 4>a?"ночи":12>a?"утра":17>a?"дня":"вечера"},ordinalParse:/\d{1,2}-(й|го|я)/,ordinal:function(a,b){switch(b){case"M":case"d":case"DDD":return a+"-й";case"D":return a+"-го";case"w":case"W":return a+"-я";default:return a}},week:{dow:1,doy:7}}),uf.defineLocale("si",{months:"ජනවාරි_පෙබරවාරි_මාර්තු_අප්‍රේල්_මැයි_ජූනි_ජූලි_අගෝස්තු_සැප්තැම්බර්_ඔක්තෝබර්_නොවැම්බර්_දෙසැම්බර්".split("_"),monthsShort:"ජන_පෙබ_මාර්_අප්_මැයි_ජූනි_ජූලි_අගෝ_සැප්_ඔක්_නොවැ_දෙසැ".split("_"),weekdays:"ඉරිදා_සඳුදා_අඟහරුවාදා_බදාදා_බ්‍රහස්පතින්දා_සිකුරාදා_සෙනසුරාදා".split("_"),weekdaysShort:"ඉරි_සඳු_අඟ_බදා_බ්‍රහ_සිකු_සෙන".split("_"),weekdaysMin:"ඉ_ස_අ_බ_බ්‍ර_සි_සෙ".split("_"),longDateFormat:{LT:"a h:mm",LTS:"a h:mm:ss",L:"YYYY/MM/DD",LL:"YYYY MMMM D",LLL:"YYYY MMMM D, a h:mm",LLLL:"YYYY MMMM D [වැනි] dddd, a h:mm:ss"},calendar:{sameDay:"[අද] LT[ට]",nextDay:"[හෙට] LT[ට]",nextWeek:"dddd LT[ට]",lastDay:"[ඊයේ] LT[ට]",lastWeek:"[පසුගිය] dddd LT[ට]",sameElse:"L"},relativeTime:{future:"%sකින්",past:"%sකට පෙර",s:"තත්පර කිහිපය",m:"මිනිත්තුව",mm:"මිනිත්තු %d",h:"පැය",hh:"පැය %d",d:"දිනය",dd:"දින %d",M:"මාසය",MM:"මාස %d",y:"වසර",yy:"වසර %d"},ordinalParse:/\d{1,2} වැනි/,ordinal:function(a){return a+" වැනි"},meridiem:function(a,b,c){return a>11?c?"ප.ව.":"පස් වරු":c?"පෙ.ව.":"පෙර වරු"}}),"január_február_marec_apríl_máj_jún_júl_august_september_október_november_december".split("_")),ig="jan_feb_mar_apr_máj_jún_júl_aug_sep_okt_nov_dec".split("_"),jg=(uf.defineLocale("sk",{months:hg,monthsShort:ig,monthsParse:function(a,b){var c,d=[];for(c=0;12>c;c++)d[c]=new RegExp("^"+a[c]+"$|^"+b[c]+"$","i");return d}(hg,ig),weekdays:"nedeľa_pondelok_utorok_streda_štvrtok_piatok_sobota".split("_"),weekdaysShort:"ne_po_ut_st_št_pi_so".split("_"),weekdaysMin:"ne_po_ut_st_št_pi_so".split("_"),longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd D. MMMM YYYY H:mm"},calendar:{sameDay:"[dnes o] LT",nextDay:"[zajtra o] LT",nextWeek:function(){switch(this.day()){case 0:return"[v nedeľu o] LT";case 1:case 2:return"[v] dddd [o] LT";case 3:return"[v stredu o] LT";case 4:return"[vo štvrtok o] LT";case 5:return"[v piatok o] LT";case 6:return"[v sobotu o] LT"}},lastDay:"[včera o] LT",lastWeek:function(){switch(this.day()){case 0:return"[minulú nedeľu o] LT";case 1:case 2:return"[minulý] dddd [o] LT";case 3:return"[minulú stredu o] LT";case 4:case 5:return"[minulý] dddd [o] LT";case 6:return"[minulú sobotu o] LT"}},sameElse:"L"},relativeTime:{future:"za %s",past:"pred %s",s:Ed,m:Ed,mm:Ed,h:Ed,hh:Ed,d:Ed,dd:Ed,M:Ed,MM:Ed,y:Ed,yy:Ed},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),uf.defineLocale("sl",{months:"januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december".split("_"),monthsShort:"jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.".split("_"),weekdays:"nedelja_ponedeljek_torek_sreda_četrtek_petek_sobota".split("_"),weekdaysShort:"ned._pon._tor._sre._čet._pet._sob.".split("_"),weekdaysMin:"ne_po_to_sr_če_pe_so".split("_"),longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"DD. MM. YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm"},calendar:{sameDay:"[danes ob] LT",nextDay:"[jutri ob] LT",nextWeek:function(){switch(this.day()){case 0:return"[v] [nedeljo] [ob] LT";case 3:return"[v] [sredo] [ob] LT";case 6:return"[v] [soboto] [ob] LT";case 1:case 2:case 4:case 5:return"[v] dddd [ob] LT"}},lastDay:"[včeraj ob] LT",lastWeek:function(){switch(this.day()){case 0:return"[prejšnjo] [nedeljo] [ob] LT";case 3:return"[prejšnjo] [sredo] [ob] LT";case 6:return"[prejšnjo] [soboto] [ob] LT";case 1:case 2:case 4:case 5:return"[prejšnji] dddd [ob] LT"}},sameElse:"L"},relativeTime:{future:"čez %s",past:"pred %s",s:Fd,m:Fd,mm:Fd,h:Fd,hh:Fd,d:Fd,dd:Fd,M:Fd,MM:Fd,y:Fd,yy:Fd},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:7}}),uf.defineLocale("sq",{months:"Janar_Shkurt_Mars_Prill_Maj_Qershor_Korrik_Gusht_Shtator_Tetor_Nëntor_Dhjetor".split("_"),monthsShort:"Jan_Shk_Mar_Pri_Maj_Qer_Kor_Gus_Sht_Tet_Nën_Dhj".split("_"),weekdays:"E Diel_E Hënë_E Martë_E Mërkurë_E Enjte_E Premte_E Shtunë".split("_"),weekdaysShort:"Die_Hën_Mar_Mër_Enj_Pre_Sht".split("_"),weekdaysMin:"D_H_Ma_Më_E_P_Sh".split("_"),meridiemParse:/PD|MD/,isPM:function(a){return"M"===a.charAt(0)},meridiem:function(a,b,c){return 12>a?"PD":"MD"},longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"},calendar:{sameDay:"[Sot në] LT",nextDay:"[Nesër në] LT",nextWeek:"dddd [në] LT",lastDay:"[Dje në] LT",lastWeek:"dddd [e kaluar në] LT",sameElse:"L"},relativeTime:{future:"në %s",past:"%s më parë",s:"disa sekonda",m:"një minutë",mm:"%d minuta",h:"një orë",hh:"%d orë",d:"një ditë",dd:"%d ditë",M:"një muaj",MM:"%d muaj",y:"një vit",yy:"%d vite"},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),{words:{m:["један минут","једне минуте"],mm:["минут","минуте","минута"],h:["један сат","једног сата"],hh:["сат","сата","сати"],dd:["дан","дана","дана"],MM:["месец","месеца","месеци"],yy:["година","године","година"]},correctGrammaticalCase:function(a,b){return 1===a?b[0]:a>=2&&4>=a?b[1]:b[2]},translate:function(a,b,c){var d=jg.words[c];return 1===c.length?b?d[0]:d[1]:a+" "+jg.correctGrammaticalCase(a,d)}}),kg=(uf.defineLocale("sr-cyrl",{months:["јануар","фебруар","март","април","мај","јун","јул","август","септембар","октобар","новембар","децембар"],monthsShort:["јан.","феб.","мар.","апр.","мај","јун","јул","авг.","сеп.","окт.","нов.","дец."],weekdays:["недеља","понедељак","уторак","среда","четвртак","петак","субота"],weekdaysShort:["нед.","пон.","уто.","сре.","чет.","пет.","суб."],weekdaysMin:["не","по","ут","ср","че","пе","су"],longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"DD. MM. YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm"},calendar:{sameDay:"[данас у] LT",nextDay:"[сутра у] LT",nextWeek:function(){switch(this.day()){case 0:return"[у] [недељу] [у] LT";case 3:return"[у] [среду] [у] LT";case 6:return"[у] [суботу] [у] LT";case 1:case 2:case 4:case 5:return"[у] dddd [у] LT"}},lastDay:"[јуче у] LT",lastWeek:function(){var a=["[прошле] [недеље] [у] LT","[прошлог] [понедељка] [у] LT","[прошлог] [уторка] [у] LT","[прошле] [среде] [у] LT","[прошлог] [четвртка] [у] LT","[прошлог] [петка] [у] LT","[прошле] [суботе] [у] LT"];return a[this.day()]},sameElse:"L"},relativeTime:{future:"за %s",past:"пре %s",s:"неколико секунди",m:jg.translate,mm:jg.translate,h:jg.translate,hh:jg.translate,d:"дан",dd:jg.translate,M:"месец",MM:jg.translate,y:"годину",yy:jg.translate},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:7}}),{words:{m:["jedan minut","jedne minute"],mm:["minut","minute","minuta"],h:["jedan sat","jednog sata"],hh:["sat","sata","sati"],dd:["dan","dana","dana"],MM:["mesec","meseca","meseci"],yy:["godina","godine","godina"]},correctGrammaticalCase:function(a,b){return 1===a?b[0]:a>=2&&4>=a?b[1]:b[2]},translate:function(a,b,c){var d=kg.words[c];return 1===c.length?b?d[0]:d[1]:a+" "+kg.correctGrammaticalCase(a,d)}}),lg=(uf.defineLocale("sr",{months:["januar","februar","mart","april","maj","jun","jul","avgust","septembar","oktobar","novembar","decembar"],monthsShort:["jan.","feb.","mar.","apr.","maj","jun","jul","avg.","sep.","okt.","nov.","dec."],weekdays:["nedelja","ponedeljak","utorak","sreda","četvrtak","petak","subota"],weekdaysShort:["ned.","pon.","uto.","sre.","čet.","pet.","sub."],weekdaysMin:["ne","po","ut","sr","če","pe","su"],longDateFormat:{LT:"H:mm",LTS:"H:mm:ss",L:"DD. MM. YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm"},calendar:{sameDay:"[danas u] LT",nextDay:"[sutra u] LT",nextWeek:function(){switch(this.day()){case 0:return"[u] [nedelju] [u] LT";case 3:return"[u] [sredu] [u] LT";case 6:return"[u] [subotu] [u] LT";case 1:case 2:case 4:case 5:return"[u] dddd [u] LT"}},lastDay:"[juče u] LT",lastWeek:function(){var a=["[prošle] [nedelje] [u] LT","[prošlog] [ponedeljka] [u] LT","[prošlog] [utorka] [u] LT","[prošle] [srede] [u] LT","[prošlog] [četvrtka] [u] LT","[prošlog] [petka] [u] LT","[prošle] [subote] [u] LT"];return a[this.day()]},sameElse:"L"},relativeTime:{future:"za %s",past:"pre %s",s:"nekoliko sekundi",m:kg.translate,mm:kg.translate,h:kg.translate,hh:kg.translate,d:"dan",dd:kg.translate,M:"mesec",MM:kg.translate,y:"godinu",yy:kg.translate},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:7}}),uf.defineLocale("sv",{months:"januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december".split("_"),monthsShort:"jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec".split("_"),weekdays:"söndag_måndag_tisdag_onsdag_torsdag_fredag_lördag".split("_"),weekdaysShort:"sön_mån_tis_ons_tor_fre_lör".split("_"),weekdaysMin:"sö_må_ti_on_to_fr_lö".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY-MM-DD",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},calendar:{sameDay:"[Idag] LT",nextDay:"[Imorgon] LT",lastDay:"[Igår] LT",nextWeek:"[På] dddd LT",lastWeek:"[I] dddd[s] LT",sameElse:"L"},relativeTime:{future:"om %s",past:"för %s sedan",s:"några sekunder",m:"en minut",mm:"%d minuter",h:"en timme",hh:"%d timmar",d:"en dag",dd:"%d dagar",M:"en månad",MM:"%d månader",y:"ett år",yy:"%d år"},ordinalParse:/\d{1,2}(e|a)/,ordinal:function(a){var b=a%10,c=1===~~(a%100/10)?"e":1===b?"a":2===b?"a":"e";return a+c},week:{dow:1,doy:4}}),uf.defineLocale("ta",{months:"ஜனவரி_பிப்ரவரி_மார்ச்_ஏப்ரல்_மே_ஜூன்_ஜூலை_ஆகஸ்ட்_செப்டெம்பர்_அக்டோபர்_நவம்பர்_டிசம்பர்".split("_"),monthsShort:"ஜனவரி_பிப்ரவரி_மார்ச்_ஏப்ரல்_மே_ஜூன்_ஜூலை_ஆகஸ்ட்_செப்டெம்பர்_அக்டோபர்_நவம்பர்_டிசம்பர்".split("_"),weekdays:"ஞாயிற்றுக்கிழமை_திங்கட்கிழமை_செவ்வாய்கிழமை_புதன்கிழமை_வியாழக்கிழமை_வெள்ளிக்கிழமை_சனிக்கிழமை".split("_"),weekdaysShort:"ஞாயிறு_திங்கள்_செவ்வாய்_புதன்_வியாழன்_வெள்ளி_சனி".split("_"),weekdaysMin:"ஞா_தி_செ_பு_வி_வெ_ச".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY, HH:mm",LLLL:"dddd, D MMMM YYYY, HH:mm"},calendar:{sameDay:"[இன்று] LT",nextDay:"[நாளை] LT",nextWeek:"dddd, LT",lastDay:"[நேற்று] LT",lastWeek:"[கடந்த வாரம்] dddd, LT",sameElse:"L"},relativeTime:{future:"%s இல்",past:"%s முன்",s:"ஒரு சில விநாடிகள்",m:"ஒரு நிமிடம்",mm:"%d நிமிடங்கள்",h:"ஒரு மணி நேரம்",hh:"%d மணி நேரம்",d:"ஒரு நாள்",dd:"%d நாட்கள்",M:"ஒரு மாதம்",MM:"%d மாதங்கள்",y:"ஒரு வருடம்",yy:"%d ஆண்டுகள்"},ordinalParse:/\d{1,2}வது/,ordinal:function(a){return a+"வது"},meridiemParse:/யாமம்|வைகறை|காலை|நண்பகல்|எற்பாடு|மாலை/,meridiem:function(a,b,c){return 2>a?" யாமம்":6>a?" வைகறை":10>a?" காலை":14>a?" நண்பகல்":18>a?" எற்பாடு":22>a?" மாலை":" யாமம்"},meridiemHour:function(a,b){return 12===a&&(a=0),"யாமம்"===b?2>a?a:a+12:"வைகறை"===b||"காலை"===b?a:"நண்பகல்"===b&&a>=10?a:a+12},week:{dow:0,doy:6}}),uf.defineLocale("th",{months:"มกราคม_กุมภาพันธ์_มีนาคม_เมษายน_พฤษภาคม_มิถุนายน_กรกฎาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม".split("_"),monthsShort:"มกรา_กุมภา_มีนา_เมษา_พฤษภา_มิถุนา_กรกฎา_สิงหา_กันยา_ตุลา_พฤศจิกา_ธันวา".split("_"),weekdays:"อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัสบดี_ศุกร์_เสาร์".split("_"),weekdaysShort:"อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัส_ศุกร์_เสาร์".split("_"),weekdaysMin:"อา._จ._อ._พ._พฤ._ศ._ส.".split("_"),longDateFormat:{LT:"H นาฬิกา m นาที",LTS:"H นาฬิกา m นาที s วินาที",L:"YYYY/MM/DD",LL:"D MMMM YYYY",LLL:"D MMMM YYYY เวลา H นาฬิกา m นาที",LLLL:"วันddddที่ D MMMM YYYY เวลา H นาฬิกา m นาที"},meridiemParse:/ก่อนเที่ยง|หลังเที่ยง/,isPM:function(a){return"หลังเที่ยง"===a},meridiem:function(a,b,c){return 12>a?"ก่อนเที่ยง":"หลังเที่ยง"},calendar:{sameDay:"[วันนี้ เวลา] LT",nextDay:"[พรุ่งนี้ เวลา] LT",nextWeek:"dddd[หน้า เวลา] LT",lastDay:"[เมื่อวานนี้ เวลา] LT",lastWeek:"[วัน]dddd[ที่แล้ว เวลา] LT",sameElse:"L"},relativeTime:{future:"อีก %s",past:"%sที่แล้ว",s:"ไม่กี่วินาที",m:"1 นาที",mm:"%d นาที",h:"1 ชั่วโมง",hh:"%d ชั่วโมง",d:"1 วัน",dd:"%d วัน",M:"1 เดือน",MM:"%d เดือน",y:"1 ปี",yy:"%d ปี"}}),uf.defineLocale("tl-ph",{months:"Enero_Pebrero_Marso_Abril_Mayo_Hunyo_Hulyo_Agosto_Setyembre_Oktubre_Nobyembre_Disyembre".split("_"),monthsShort:"Ene_Peb_Mar_Abr_May_Hun_Hul_Ago_Set_Okt_Nob_Dis".split("_"),weekdays:"Linggo_Lunes_Martes_Miyerkules_Huwebes_Biyernes_Sabado".split("_"),weekdaysShort:"Lin_Lun_Mar_Miy_Huw_Biy_Sab".split("_"),weekdaysMin:"Li_Lu_Ma_Mi_Hu_Bi_Sab".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"MM/D/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY HH:mm",LLLL:"dddd, MMMM DD, YYYY HH:mm"},calendar:{sameDay:"[Ngayon sa] LT",nextDay:"[Bukas sa] LT",nextWeek:"dddd [sa] LT",lastDay:"[Kahapon sa] LT",lastWeek:"dddd [huling linggo] LT",sameElse:"L"},relativeTime:{future:"sa loob ng %s",past:"%s ang nakalipas",s:"ilang segundo",m:"isang minuto",mm:"%d minuto",h:"isang oras",hh:"%d oras",d:"isang araw",dd:"%d araw",M:"isang buwan",MM:"%d buwan",y:"isang taon",yy:"%d taon"},ordinalParse:/\d{1,2}/,ordinal:function(a){return a},week:{dow:1,doy:4}}),{1:"'inci",5:"'inci",8:"'inci",70:"'inci",80:"'inci",2:"'nci",7:"'nci",20:"'nci",50:"'nci",3:"'üncü",4:"'üncü",100:"'üncü",6:"'ncı",9:"'uncu",10:"'uncu",30:"'uncu",60:"'ıncı",90:"'ıncı"}),mg=(uf.defineLocale("tr",{months:"Ocak_Şubat_Mart_Nisan_Mayıs_Haziran_Temmuz_Ağustos_Eylül_Ekim_Kasım_Aralık".split("_"),monthsShort:"Oca_Şub_Mar_Nis_May_Haz_Tem_Ağu_Eyl_Eki_Kas_Ara".split("_"),weekdays:"Pazar_Pazartesi_Salı_Çarşamba_Perşembe_Cuma_Cumartesi".split("_"),weekdaysShort:"Paz_Pts_Sal_Çar_Per_Cum_Cts".split("_"),weekdaysMin:"Pz_Pt_Sa_Ça_Pe_Cu_Ct".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"},calendar:{sameDay:"[bugün saat] LT",nextDay:"[yarın saat] LT",nextWeek:"[haftaya] dddd [saat] LT",lastDay:"[dün] LT",lastWeek:"[geçen hafta] dddd [saat] LT",sameElse:"L"},relativeTime:{future:"%s sonra",past:"%s önce",s:"birkaç saniye",m:"bir dakika",mm:"%d dakika",h:"bir saat",hh:"%d saat",d:"bir gün",dd:"%d gün",M:"bir ay",MM:"%d ay",y:"bir yıl",yy:"%d yıl"},ordinalParse:/\d{1,2}'(inci|nci|üncü|ncı|uncu|ıncı)/,ordinal:function(a){if(0===a)return a+"'ıncı";var b=a%10,c=a%100-b,d=a>=100?100:null;return a+(lg[b]||lg[c]||lg[d])},week:{dow:1,doy:7}}),uf.defineLocale("tzl",{months:"Januar_Fevraglh_Març_Avrïu_Mai_Gün_Julia_Guscht_Setemvar_Listopäts_Noemvar_Zecemvar".split("_"),monthsShort:"Jan_Fev_Mar_Avr_Mai_Gün_Jul_Gus_Set_Lis_Noe_Zec".split("_"),weekdays:"Súladi_Lúneçi_Maitzi_Márcuri_Xhúadi_Viénerçi_Sáturi".split("_"),weekdaysShort:"Súl_Lún_Mai_Már_Xhú_Vié_Sát".split("_"),weekdaysMin:"Sú_Lú_Ma_Má_Xh_Vi_Sá".split("_"),longDateFormat:{LT:"HH.mm",LTS:"LT.ss",L:"DD.MM.YYYY",LL:"D. MMMM [dallas] YYYY",LLL:"D. MMMM [dallas] YYYY LT",LLLL:"dddd, [li] D. MMMM [dallas] YYYY LT"},meridiem:function(a,b,c){return a>11?c?"d'o":"D'O":c?"d'a":"D'A"},calendar:{sameDay:"[oxhi à] LT",nextDay:"[demà à] LT",nextWeek:"dddd [à] LT",lastDay:"[ieiri à] LT",lastWeek:"[sür el] dddd [lasteu à] LT",sameElse:"L"},relativeTime:{future:"osprei %s",past:"ja%s",s:Gd,m:Gd,mm:Gd,h:Gd,hh:Gd,d:Gd,dd:Gd,M:Gd,MM:Gd,y:Gd,yy:Gd},ordinalParse:/\d{1,2}\./,ordinal:"%d.",week:{dow:1,doy:4}}),uf.defineLocale("tzm-latn",{months:"innayr_brˤayrˤ_marˤsˤ_ibrir_mayyw_ywnyw_ywlywz_ɣwšt_šwtanbir_ktˤwbrˤ_nwwanbir_dwjnbir".split("_"),monthsShort:"innayr_brˤayrˤ_marˤsˤ_ibrir_mayyw_ywnyw_ywlywz_ɣwšt_šwtanbir_ktˤwbrˤ_nwwanbir_dwjnbir".split("_"),weekdays:"asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas".split("_"),weekdaysShort:"asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas".split("_"),weekdaysMin:"asamas_aynas_asinas_akras_akwas_asimwas_asiḍyas".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},calendar:{sameDay:"[asdkh g] LT",nextDay:"[aska g] LT",nextWeek:"dddd [g] LT",lastDay:"[assant g] LT",lastWeek:"dddd [g] LT",sameElse:"L"},relativeTime:{future:"dadkh s yan %s",past:"yan %s",s:"imik",m:"minuḍ",mm:"%d minuḍ",h:"saɛa",hh:"%d tassaɛin",d:"ass",dd:"%d ossan",M:"ayowr",MM:"%d iyyirn",y:"asgas",yy:"%d isgasn"},week:{dow:6,doy:12}}),uf.defineLocale("tzm",{months:"ⵉⵏⵏⴰⵢⵔ_ⴱⵕⴰⵢⵕ_ⵎⴰⵕⵚ_ⵉⴱⵔⵉⵔ_ⵎⴰⵢⵢⵓ_ⵢⵓⵏⵢⵓ_ⵢⵓⵍⵢⵓⵣ_ⵖⵓⵛⵜ_ⵛⵓⵜⴰⵏⴱⵉⵔ_ⴽⵟⵓⴱⵕ_ⵏⵓⵡⴰⵏⴱⵉⵔ_ⴷⵓⵊⵏⴱⵉⵔ".split("_"),monthsShort:"ⵉⵏⵏⴰⵢⵔ_ⴱⵕⴰⵢⵕ_ⵎⴰⵕⵚ_ⵉⴱⵔⵉⵔ_ⵎⴰⵢⵢⵓ_ⵢⵓⵏⵢⵓ_ⵢⵓⵍⵢⵓⵣ_ⵖⵓⵛⵜ_ⵛⵓⵜⴰⵏⴱⵉⵔ_ⴽⵟⵓⴱⵕ_ⵏⵓⵡⴰⵏⴱⵉⵔ_ⴷⵓⵊⵏⴱⵉⵔ".split("_"),weekdays:"ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ".split("_"),weekdaysShort:"ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ".split("_"),weekdaysMin:"ⴰⵙⴰⵎⴰⵙ_ⴰⵢⵏⴰⵙ_ⴰⵙⵉⵏⴰⵙ_ⴰⴽⵔⴰⵙ_ⴰⴽⵡⴰⵙ_ⴰⵙⵉⵎⵡⴰⵙ_ⴰⵙⵉⴹⵢⴰⵙ".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},calendar:{sameDay:"[ⴰⵙⴷⵅ ⴴ] LT",nextDay:"[ⴰⵙⴽⴰ ⴴ] LT",nextWeek:"dddd [ⴴ] LT",lastDay:"[ⴰⵚⴰⵏⵜ ⴴ] LT",lastWeek:"dddd [ⴴ] LT",sameElse:"L"},relativeTime:{future:"ⴷⴰⴷⵅ ⵙ ⵢⴰⵏ %s",past:"ⵢⴰⵏ %s",s:"ⵉⵎⵉⴽ",m:"ⵎⵉⵏⵓⴺ",mm:"%d ⵎⵉⵏⵓⴺ",h:"ⵙⴰⵄⴰ",hh:"%d ⵜⴰⵙⵙⴰⵄⵉⵏ",d:"ⴰⵙⵙ",dd:"%d oⵙⵙⴰⵏ",M:"ⴰⵢoⵓⵔ",MM:"%d ⵉⵢⵢⵉⵔⵏ",y:"ⴰⵙⴳⴰⵙ",yy:"%d ⵉⵙⴳⴰⵙⵏ"},week:{dow:6,doy:12}}),uf.defineLocale("uk",{months:Jd,monthsShort:"січ_лют_бер_квіт_трав_черв_лип_серп_вер_жовт_лист_груд".split("_"),weekdays:Kd,weekdaysShort:"нд_пн_вт_ср_чт_пт_сб".split("_"),weekdaysMin:"нд_пн_вт_ср_чт_пт_сб".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY р.",LLL:"D MMMM YYYY р., HH:mm",LLLL:"dddd, D MMMM YYYY р., HH:mm"},calendar:{sameDay:Ld("[Сьогодні "),nextDay:Ld("[Завтра "),lastDay:Ld("[Вчора "),nextWeek:Ld("[У] dddd ["),lastWeek:function(){switch(this.day()){case 0:case 3:case 5:case 6:return Ld("[Минулої] dddd [").call(this);case 1:case 2:case 4:return Ld("[Минулого] dddd [").call(this)}},sameElse:"L"},relativeTime:{future:"за %s",past:"%s тому",s:"декілька секунд",m:Id,mm:Id,h:"годину",hh:Id,d:"день",dd:Id,M:"місяць",MM:Id,y:"рік",yy:Id},meridiemParse:/ночі|ранку|дня|вечора/,isPM:function(a){return/^(дня|вечора)$/.test(a)},meridiem:function(a,b,c){return 4>a?"ночі":12>a?"ранку":17>a?"дня":"вечора"},ordinalParse:/\d{1,2}-(й|го)/,ordinal:function(a,b){switch(b){case"M":case"d":case"DDD":case"w":case"W":return a+"-й";case"D":return a+"-го";default:return a}},week:{dow:1,doy:7}}),uf.defineLocale("uz",{months:"январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь".split("_"),monthsShort:"янв_фев_мар_апр_май_июн_июл_авг_сен_окт_ноя_дек".split("_"),weekdays:"Якшанба_Душанба_Сешанба_Чоршанба_Пайшанба_Жума_Шанба".split("_"),weekdaysShort:"Якш_Душ_Сеш_Чор_Пай_Жум_Шан".split("_"),weekdaysMin:"Як_Ду_Се_Чо_Па_Жу_Ша".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"D MMMM YYYY, dddd HH:mm"},calendar:{sameDay:"[Бугун соат] LT [да]",nextDay:"[Эртага] LT [да]",nextWeek:"dddd [куни соат] LT [да]",lastDay:"[Кеча соат] LT [да]",lastWeek:"[Утган] dddd [куни соат] LT [да]",sameElse:"L"},relativeTime:{future:"Якин %s ичида",past:"Бир неча %s олдин",s:"фурсат",m:"бир дакика",mm:"%d дакика",h:"бир соат",hh:"%d соат",d:"бир кун",dd:"%d кун",M:"бир ой",MM:"%d ой",y:"бир йил",yy:"%d йил"},week:{dow:1,doy:7}}),uf.defineLocale("vi",{months:"tháng 1_tháng 2_tháng 3_tháng 4_tháng 5_tháng 6_tháng 7_tháng 8_tháng 9_tháng 10_tháng 11_tháng 12".split("_"),monthsShort:"Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12".split("_"),weekdays:"chủ nhật_thứ hai_thứ ba_thứ tư_thứ năm_thứ sáu_thứ bảy".split("_"),weekdaysShort:"CN_T2_T3_T4_T5_T6_T7".split("_"),weekdaysMin:"CN_T2_T3_T4_T5_T6_T7".split("_"),longDateFormat:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM [năm] YYYY",LLL:"D MMMM [năm] YYYY HH:mm",LLLL:"dddd, D MMMM [năm] YYYY HH:mm",l:"DD/M/YYYY",ll:"D MMM YYYY",lll:"D MMM YYYY HH:mm",
llll:"ddd, D MMM YYYY HH:mm"},calendar:{sameDay:"[Hôm nay lúc] LT",nextDay:"[Ngày mai lúc] LT",nextWeek:"dddd [tuần tới lúc] LT",lastDay:"[Hôm qua lúc] LT",lastWeek:"dddd [tuần rồi lúc] LT",sameElse:"L"},relativeTime:{future:"%s tới",past:"%s trước",s:"vài giây",m:"một phút",mm:"%d phút",h:"một giờ",hh:"%d giờ",d:"một ngày",dd:"%d ngày",M:"một tháng",MM:"%d tháng",y:"một năm",yy:"%d năm"},ordinalParse:/\d{1,2}/,ordinal:function(a){return a},week:{dow:1,doy:4}}),uf.defineLocale("zh-cn",{months:"一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),monthsShort:"1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),weekdays:"星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),weekdaysShort:"周日_周一_周二_周三_周四_周五_周六".split("_"),weekdaysMin:"日_一_二_三_四_五_六".split("_"),longDateFormat:{LT:"Ah点mm分",LTS:"Ah点m分s秒",L:"YYYY-MM-DD",LL:"YYYY年MMMD日",LLL:"YYYY年MMMD日Ah点mm分",LLLL:"YYYY年MMMD日ddddAh点mm分",l:"YYYY-MM-DD",ll:"YYYY年MMMD日",lll:"YYYY年MMMD日Ah点mm分",llll:"YYYY年MMMD日ddddAh点mm分"},meridiemParse:/凌晨|早上|上午|中午|下午|晚上/,meridiemHour:function(a,b){return 12===a&&(a=0),"凌晨"===b||"早上"===b||"上午"===b?a:"下午"===b||"晚上"===b?a+12:a>=11?a:a+12},meridiem:function(a,b,c){var d=100*a+b;return 600>d?"凌晨":900>d?"早上":1130>d?"上午":1230>d?"中午":1800>d?"下午":"晚上"},calendar:{sameDay:function(){return 0===this.minutes()?"[今天]Ah[点整]":"[今天]LT"},nextDay:function(){return 0===this.minutes()?"[明天]Ah[点整]":"[明天]LT"},lastDay:function(){return 0===this.minutes()?"[昨天]Ah[点整]":"[昨天]LT"},nextWeek:function(){var a,b;return a=uf().startOf("week"),b=this.unix()-a.unix()>=604800?"[下]":"[本]",0===this.minutes()?b+"dddAh点整":b+"dddAh点mm"},lastWeek:function(){var a,b;return a=uf().startOf("week"),b=this.unix()<a.unix()?"[上]":"[本]",0===this.minutes()?b+"dddAh点整":b+"dddAh点mm"},sameElse:"LL"},ordinalParse:/\d{1,2}(日|月|周)/,ordinal:function(a,b){switch(b){case"d":case"D":case"DDD":return a+"日";case"M":return a+"月";case"w":case"W":return a+"周";default:return a}},relativeTime:{future:"%s内",past:"%s前",s:"几秒",m:"1 分钟",mm:"%d 分钟",h:"1 小时",hh:"%d 小时",d:"1 天",dd:"%d 天",M:"1 个月",MM:"%d 个月",y:"1 年",yy:"%d 年"},week:{dow:1,doy:4}}),uf.defineLocale("zh-tw",{months:"一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),monthsShort:"1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),weekdays:"星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),weekdaysShort:"週日_週一_週二_週三_週四_週五_週六".split("_"),weekdaysMin:"日_一_二_三_四_五_六".split("_"),longDateFormat:{LT:"Ah點mm分",LTS:"Ah點m分s秒",L:"YYYY年MMMD日",LL:"YYYY年MMMD日",LLL:"YYYY年MMMD日Ah點mm分",LLLL:"YYYY年MMMD日ddddAh點mm分",l:"YYYY年MMMD日",ll:"YYYY年MMMD日",lll:"YYYY年MMMD日Ah點mm分",llll:"YYYY年MMMD日ddddAh點mm分"},meridiemParse:/早上|上午|中午|下午|晚上/,meridiemHour:function(a,b){return 12===a&&(a=0),"早上"===b||"上午"===b?a:"中午"===b?a>=11?a:a+12:"下午"===b||"晚上"===b?a+12:void 0},meridiem:function(a,b,c){var d=100*a+b;return 900>d?"早上":1130>d?"上午":1230>d?"中午":1800>d?"下午":"晚上"},calendar:{sameDay:"[今天]LT",nextDay:"[明天]LT",nextWeek:"[下]ddddLT",lastDay:"[昨天]LT",lastWeek:"[上]ddddLT",sameElse:"L"},ordinalParse:/\d{1,2}(日|月|週)/,ordinal:function(a,b){switch(b){case"d":case"D":case"DDD":return a+"日";case"M":return a+"月";case"w":case"W":return a+"週";default:return a}},relativeTime:{future:"%s內",past:"%s前",s:"幾秒",m:"一分鐘",mm:"%d分鐘",h:"一小時",hh:"%d小時",d:"一天",dd:"%d天",M:"一個月",MM:"%d個月",y:"一年",yy:"%d年"}}),uf);return mg.locale("en"),mg});
function detectDevice(){
	var devices = new Array('ipad','iphone','ipod','android','blackberry','windows phone','IEMobile','Opera Mini');
	var deviceName, windowMin, windowMax, orientation;
	devices.forEach(function(item) { // Se non funziona in tutti i browser usare ciclo for
		var regex = new RegExp(item,"i");
		var deviceCheck = regex.test(navigator.userAgent.toLowerCase());
		if(deviceCheck == true){
			deviceName = item;
		}
	});
	if($(window).height() < $(window).width()){
		windowMin = $(window).height();
		windowMax = $(window).width();
		orientation = 'landscape';
	} else {
		windowMax = $(window).height();
		windowMin = $(window).width();
		orientation = 'portrait';
	}
	if(!deviceName){
		deviceName = 'desktop';
		deviceCat = 'desktop';
	}
	else {
		if(windowMin < 672){ //cambiare valore?
			deviceCat = 'smartphone';
		} else {
			deviceCat = 'tablet';
		}
	}

	var deviceRatio = window.devicePixelRatio;
	var device = new Array(deviceCat,deviceName,windowMin,windowMax,orientation,deviceRatio); // deviceCat 0 - deviceName 1 - windowMin 2 - windowMax 3 - orientation 4 - deviceRatio 5
	return device;
}

Proj4js.defs["EPSG:25832"] = "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs";
Proj4js.defs["EPSG:3857"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";
Proj4js.defs["EPSG:900913"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";

var defaultProjection = new OpenLayers.Projection('EPSG:3857');


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function getPresetFromUrl(value){
	return location.search.substring(1)===value;
}
var preConfigMap = {
	p1:{
		zoom:18,
		lon:1241251.0433325,
		lat:5888918.4656567,
	},
	p2:{
		zoom:18,
		lon:1242275.7794428,
		lat:5888727.0753039,
	},
	p4:{
		zoom:18,
		lon:1242236.3628001,
		lat:5888148.1253312,
	},
	p5:{
		zoom:18,
		lon:1242522.4036918,
		lat:5888480.4480549,
	},
	p6:{
		zoom:18,
		lon:1242819.1935406,
		lat:5888359.5230875,
	},
	p7:{
		zoom:18,
		lon:1242853.828269,
		lat:5888584.3562402,
	},
	p8:{
		zoom:18,
		lon:1242238.1510928,
		lat:5889129.8666131,
	},
	p9:{
		zoom:17,
		lon:1243900.0680937,
		lat:5888210.8219807
	},
	p10:{
		zoom:17,
		lon:1240786.4535201,
		lat:5890727.2722709
	},
	p11:{
		zoom:17,
		lon:1243912.0113794,
		lat:5889700.1497033
	},
	p12:{
		zoom:17,
		lon:1244961.8261896,
		lat:5886861.2307003
	}
}
var epsg25832 = new OpenLayers.Projection('EPSG:25832');
var SASABus = {
    config: {
	city:'',
        r3EndPoint: 'https://realtimebus.sasabus.org/',
	integreenEndPoint:'ipchannels.integreen-life.bz.it/',
	apiediEndPoint:'https://apiedi.testingmachine.eu',
	//apiediEndPoint:'http://localhost:8080/apiedi',
	geoserverEndPoint:'https://geodata.integreen-life.bz.it/',
        busPopupSelector: '#busPopup',
        stopPopupSelector: '#stopPopup',
        rowsLimit: 6,
        mapDivId: null,
        defaultDialogOptions: {},
        pinToDialogDistance: 47,
        pinHeight: 74,
        yOffset: 0,
        xOffset: 20
    },

    tpl: {
        busRow: undefined,
        busContent: undefined,
        stopRow: undefined,
        stopContent: undefined
    },

    updateBusTimeout: undefined,
    map: undefined,
    stopsLayer: undefined,
    positionLayer: undefined,
    lines: undefined,
    geolocate: undefined,
    locationLayer: undefined,
    activateSelectedThemes: function(activeThemes){
	var me = this;
	var layerMap = {
		walking:[wegeStartPointsLayer,artPoints,routesLayer,zugangLayer],
		bus:[linesLayer,busPositionLayer,stopsLayer],
		carsharing:[carSharingLayer],
		//bike:[bikeSharingLayer,provinceBikeNetwork],
		emobility:[echargingLayer],
		carpooling:[carpoolingLayer],
    parking:[parkingLayer],
	}
	$.each(layerMap,function(key,value){				//hide all layers which are in non active Themes
    if ($.inArray(key,activeThemes) == -1){
			$.each(value,function(index,object){
        var obj = object.get();
				if(obj)
					if ($.isArray(obj)){
						$.each(obj,function(index,ovalue){
                                                	ovalue.setVisibility(false);
						});
					}
					else if (me.map.getLayer(obj.id) != null){
						obj.setVisibility(false);
					}
			});
		}
	});
	var activeLayers=[];
	$('.config').hide();
	$.each(activeThemes,function(index,object){		//choose Layers to activate
		$('#'+object+'-c').show();
		if (object != undefined && object.length>0 && layerMap[object] != undefined){
			$.each(layerMap[object],function(index,value){
				activeLayers = activeLayers.concat(value);		//get Singleton of layer
			});
		}
	});
	$.each(activeLayers,function(index,object){		//add Layers or set to visible if already added
    var obj = object.get();
		if (obj == null || $.isArray(obj))
      return;
		if (me.map.getLayer(obj.id) == null){
			me.map.addLayer(obj);
			if (object.populate)
				object.populate();
		}
		object.layer.setVisibility(true);
	});
	me.map.addLayer(me.locationLayer);
	var controlOptions={toggle:true};
        var control = new OpenLayers.Control.SelectFeature(me.map.getLayersByClass("OpenLayers.Layer.Vector") ,controlOptions);//choose Layers which can be interacted with
        me.map.addControl(control);
        control.activate();
	var mapMousePosition = new OpenLayers.Control.MousePosition({
        	displayProjection: defaultProjection
	});
	me.map.addControl(mapMousePosition);
	var callbacks = {
		keydown: function(evt) {
			if (evt.keyCode == 76 && evt.shiftKey && evt.ctrlKey) {
      				var pixel = new OpenLayers.Pixel(mapMousePosition.lastXy.x, mapMousePosition.lastXy.y)
				var lonLat = me.map.getLonLatFromPixel(pixel);
				window.location.replace("https://bus.meran.eu/alpha/?zoom="+me.map.getZoom()+"&lon="+lonLat.lon+"&lat="+lonLat.lat);
			}
		}
	};
	var control = new OpenLayers.Control();
	var handler = new OpenLayers.Handler.Keyboard(control, callbacks, {});
	handler.activate();
	me.map.addControl(control);
    },
    init: function(targetDivId) {
        var me = this;
        me.config.mapDivId = targetDivId;
        var mapOptions = {
            projection: defaultProjection,
            controls: [new OpenLayers.Control.Attribution(), new OpenLayers.Control.Navigation()],
	    fractionalZoom: false,
	    units:'m',
	    center:new OpenLayers.LonLat(1242107.3809149, 5889462.4783187),

        };
        me.map = new OpenLayers.Map(targetDivId, mapOptions);
        var topoMap = new OpenLayers.Layer.TMS('topo', 'http://sdi.provincia.bz.it/geoserver/gwc/service/tms/',{
            'layername': 'WMTS_OF2011_APB-PAB',
            'type': 'png8',
            visibility: true,
            opacity: 0.75,
            attribution: '',

        });
	function osm_getTileURL(bounds) {
            var res = me.map.getResolution();
            var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
            var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
            var z = this.map.getZoom();
            var limit = Math.pow(2, z);

            if (y < 0 || y >= limit) {
                return OpenLayers.Util.getImagesLocation() + "404.png";
            } else {
                x = ((x % limit) + limit) % limit;
                return this.url + z + "/" + x + "/" + y + "." + this.type;
            }
        }
        var osm = new OpenLayers.Layer.OSM("standardosm",null,{
		 numZoomLevels: 18,
		 projection: defaultProjection,
	});
        var styleMap = new OpenLayers.StyleMap({
            pointRadius: 20,
            externalGraphic: 'images/pin.png',
	    graphicYOffset:-40,
	    graphicXOffset:-20
        });
        me.locationLayer = new OpenLayers.Layer.Vector('Geolocation layer', {
            styleMap: styleMap
        });
        me.map.addLayers([osm,topoMap]);

	var reqP = {
		zoom:parseInt(getParameterByName('zoom')),
		lon:parseFloat(getParameterByName('lon')),
		lat:parseFloat(getParameterByName('lat')),

	}
	var keys = Object.keys(preConfigMap);
	$.each(keys,function(index,value){
		if (getPresetFromUrl(value))
			reqP = preConfigMap[value];
	});
	var merano = new OpenLayers.Bounds(662500, 5169000, 667600, 5174000).transform(epsg25832,defaultProjection);
        me.map.zoomToExtent(merano);
	if (reqP.lon && reqP.lat)
		me.map.panTo(new OpenLayers.LonLat(reqP.lon,reqP.lat));
	if (me.map.isValidZoomLevel(reqP.zoom))
		me.map.zoomTo(reqP.zoom);
        var geometry = new OpenLayers.Geometry.Point(reqP.lon,reqP.lat);
        var feature = new OpenLayers.Feature.Vector(geometry);
        me.locationLayer.addFeatures([feature]);
        setTimeout(function() {
            $('#zoomInButton').click(function(event) {
                event.preventDefault();

                me.map.zoomIn();
            });
            $('#zoomOutButton').click(function(event) {
                event.preventDefault();

                me.map.zoomOut();
            });
            $('#zoomToMyPosition').click(function(event) {
                event.preventDefault();

                me.zoomToCurrentPosition();
            });
	    $('#switcheroo').click(function(event){
		if (me.map.baseLayer == osm){
			me.map.setBaseLayer(topoMap);
			$('#switcheroo').text('OSM');
		}
		else{
			me.map.setBaseLayer(osm);
			$('#switcheroo').text('EARTH');
		}
	    });
        }, 2500);
    },

    getServerTime: function(success, failure, scope) {
        scope = scope || null;
        failure = failure || function() {};
        $.ajax({
            type: 'GET',
            crossDomain: true,
            url: this.config.r3EndPoint + 'time',
            dataType: 'jsonp',
            jsonp: 'jsonp',
            success: function(response, status, xhr) {
                if(!response || !response.time) failure.call(scope, xhr, status, response);
                success.call(scope, response.time);
            },
            error: function(xhr, status, error) {
                failure.call(scope, xhr, status, error);
            }
        });
    },

    alert: function(msg) {
        if(typeof(SASABusAlert) == 'function') {
            SASABusAlert.call(null, msg);
        } else {
            alert(msg);
        }
    },

    zoomToCurrentPosition: function() {
        if(!this.geolocate) {
            this.geolocate = new OpenLayers.Control.Geolocate({
                bind: true,
                watch: false,
                geolocationOptions: {
                    enableHighAccuracy: true,
                    maximumAge: 3000,
                    timeout: 50000
                }
            });
            this.geolocate.events.register('locationupdated', this, function(e) {
                this.locationLayer.removeAllFeatures();

                var lonLat = new OpenLayers.LonLat(e.point.x, e.point.y);
                if(!this.map.getExtent().containsLonLat(lonLat)) {
                    this.alert('Your position is outside this map');
                }

                var geometry = new OpenLayers.Geometry.Point(e.point.x, e.point.y);
                var feature = new OpenLayers.Feature.Vector(geometry);
                this.locationLayer.addFeatures([feature]);
                this.map.panTo(lonLat);
            });
            this.geolocate.events.register('locationfailed', this, function() {
                this.alert('Unable to get your position');
            });
            this.geolocate.events.register('locationuncapable', this, function() {
                this.alert('Geolocation is disabled');
            });
            this.map.addControl(this.geolocate);
        }
        this.geolocate.activate();
    },

    showGeoJSON: function(geojson) {
        if(!this.testLayer) {
            this.testLayer = new OpenLayers.Layer.Vector('TEST');
            this.map.addLayers([this.testLayer]);
        }

        var format = new OpenLayers.Format.GeoJSON();
        var features4326 = format.read(geojson);
        if(!features4326) return console.log('errore nel parsing...');
        var features = [];
        for(var i = 0; i < features4326.length; i++) {
            var geometry = features4326[i].geometry.transform(new OpenLayers.Projection('EPSG:4326'),defaultProjection);
            features.push(new OpenLayers.Feature.Vector(geometry, features4326[i].attributes));
        }
        this.testLayer.removeAllFeatures();
        this.testLayer.addFeatures(features);
        this.map.zoomToExtent(this.testLayer.getDataExtent());
    },

    geocode: function(params, success, failure, scope) {
        var me = this;
        scope = scope || null;
        failure = failure || function() {};
        if(!success) return console.log('success callback is mandatory when calling geocode');

        if(typeof(params) == 'string') {
            params = {
                source: 'both',
                query: params
            };
        } else {
            if(!params.source) params.source = 'both';
            else if(params.source != 'google' && params.source != 'stops') {
                return console.log('source param shall be google or stops, '+params.source+' given');
            }
        }
        if(this.lines) {
            var lines = [];
            for(var i = 0; i < this.lines.length; i++) {
                lines.push(this.lines[i].li_nr+':'+this.lines[i].str_li_var);
            }
            params.lines = lines.join(',');
        }
        $.ajax({
            type: 'GET',
            url: me.config.r3EndPoint + 'geocode',
            data: params,
            dataType: 'jsonp',
            crossDomain: true,
            jsonp: 'jsonp',
            success: function(response, status, xhr) {
                if(!response || typeof(response) != 'object') failure.call(scope, xhr, status, response);
                var results = [];
                for(var i = 0; i < response.length; i++) {
                    var row = response[i];
                    if(row.srid) {
                        var lonLat = new OpenLayers.LonLat(row.lon, row.lat);
                        lonLat.transform(new OpenLayers.Projection(row.srid), defaultProjection);
                        row.lon = lonLat.lon;
                        row.lat = lonLat.lat;
                    }
                    results.push(row);
                }
                success.call(scope, results);
            },
            error: function(xhr, status, error) {
                failure.call(scope, xhr, status, error);
            }
        });
    },
    routeToLocation : function(whereTo){
	$.ajax({
	        type: 'GET',
        	crossDomain: true,
		url:'http://localhost:8000/api/1.0/gosmore.php?format=geojson&flat=52.215676&flon=5.963946&tlat=52.2573&tlon=6.1799&v=foot',
        	dataType: 'json',
	        jsonp: 'json',
        	success: function(response, status, xhr) {
			console.log(response);
	        },
        	error: function(xhr, status, error) {
			console.log(error);
		}
        });
    },
    showLocation: function(lon, lat) {
        try {
            var lonLat = new OpenLayers.LonLat(lon, lat);
        } catch(e) {
            return console.log('invalid lon lat');
        }
        if(!lonLat.lon || !lonLat.lat) return console.log('invalid lon lat');

        this.map.setCenter(lonLat, 6);
        var geometry = new OpenLayers.Geometry.Point(lon, lat);
        var feature = new OpenLayers.Feature.Vector(geometry);
        this.locationLayer.removeAllFeatures();
        this.locationLayer.addFeatures([feature]);
    },
    addLocation: function(lon, lat) {
        try {
            var lonLat = new OpenLayers.LonLat(lon, lat);
        } catch(e) {
            return console.log('invalid lon lat');
        }
        if(!lonLat.lon || !lonLat.lat) return console.log('invalid lon lat');

        var geometry = new OpenLayers.Geometry.Point(lon, lat);
        var feature = new OpenLayers.Feature.Vector(geometry);
        this.locationLayer.addFeatures([feature]);
    },

    removeAllLocations: function() {
        this.locationLayer.removeAllFeatures();
    }
};


if(typeof(console) == 'undefined') console = {log: function(){}, trace: function(){}, error: function(){}};

var myroutes;
var routesLayer = {
	isCached : false,
	get :function (){
		if (this.isCached && this.layer != undefined)
                        return this.layer;
		this.layer = SASABus.map.getLayersByName("routes");
		return this.layer;
	}
}
var zugangLayer = {
	isCached : false,
	get :function (){
		if (this.isCached && this.layer != undefined)
                        return this.layer;
		this.layer = SASABus.map.getLayersByName("zugang");
		return this.layer;
	}
}
var artPoints = {
	isCached: true,
	get : function(){
		if (this.isCached && this.layer != undefined)
                        return this.layer;
		var styleMap = new OpenLayers.StyleMap({
                	externalGraphic: 'images/Themenwege/parcours_bueste.svg',
                        graphicWidth: 35,
                        graphicYOffset:-35.75
                });
                var point = new OpenLayers.Geometry.Point(1242010.4917555, 5888330.0435492);
                var pointFeature = new OpenLayers.Feature.Vector(point, null, null);
                var vectorLayer = new OpenLayers.Layer.Vector("artLayer",{
                	styleMap:styleMap
                });
                vectorLayer.addFeatures([pointFeature]);
                vectorLayer.events.on({
                	"featureselected":function(e){
                        	$(".modal").hide();
                                $("#artModal").show();
                        }
                });
		this.layer = vectorLayer;
                return this.layer;
	}
}
var wegeStartPointsLayer = {
	isCached : true,
	get : function(){
		if (this.isCached && this.layer != undefined)
                        return this.layer;
        	var styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({
            		externalGraphic: '${externalGraphic}',
            		graphicWidth: 35,
            		graphicYOffset:-35.75,
        	},{
            		context: {
                		externalGraphic:function(feature){
                        		var pin= 'images/4_Piedi/Pin.svg';
		                        if (feature.cluster){
        		                        if (feature.cluster.length>5)
                		                        pin = 'images/4_Piedi/Pin_5+.png';
                        		        else
                                		        pin = 'images/4_Piedi/Pin_'+feature.cluster.length+'.png';
		                        }
        		                return pin;
                		}
	            	}
        	}));
        	var positionsLayer = new OpenLayers.Layer.Vector("wegeStartPointsLayer", {
            		strategies: [new OpenLayers.Strategy.Fixed(),new OpenLayers.Strategy.Cluster({distance: 40,threshold: 3})],
            		protocol: new OpenLayers.Protocol.Script({
                		url: SASABus.config.apiediEndPoint+"/startPoints"
            		}),
            		styleMap: styleMap,
        	});
        	positionsLayer.events.on({
                	"featureselected":function(e){
                        	if (!e.feature.cluster){
                                	var id = e.feature.attributes['id'];
	                                wegeStartPointsLayer.getRouteProfile(id);
        	                }else{
														var vectors = new OpenLayers.Layer.Vector("vector", {isBaseLayer: false});
									          vectors.addFeatures(e.feature.cluster);
									          var dataExtent = vectors.getDataExtent();
									          SASABus.map.setCenter(e.feature.geometry.bounds.centerLonLat);
									          SASABus.map.zoomToExtent(dataExtent);
													}
                	},
                	"featureunselected":function(e){
                        	if (!e.feature.cluster){
                                	var id = e.feature.attributes['id'];
                                	wegeStartPointsLayer.getRouteProfile(id);
	                        }
        	        }
	        });
		this.layer = positionsLayer;
                return this.layer;

		function getArtAndNature(){
        		var styleMap = {
            			externalGraphic: 'images/Themenwege/parcours_kunst.svg',
            			graphicWidth: 35,
            			graphicYOffset:-35.75
        		};
        		var a4 = new OpenLayers.Geometry.Point(1242745.4729163,5888025.5994863);
						var a10 = new OpenLayers.Geometry.Point(1242530.8030306,5888901.4926254);
        		var a11 = new OpenLayers.Geometry.Point(1242887.9016938,5888797.5916185);
		        var a12 = new OpenLayers.Geometry.Point(1243162.2935862,5888651.4276554);
		        var a9 = new OpenLayers.Geometry.Point(1243393.9933282,5888649.0389983);
		        var a8 = new OpenLayers.Geometry.Point(1243370.1067568,5888601.2658556);
		        var a7 = new OpenLayers.Geometry.Point(1243225.5930002,5888277.602814);
		        var a6 = new OpenLayers.Geometry.Point(1242826.8587081307,5888218.633061022);
		        var a5 = new OpenLayers.Geometry.Point(1242808.7723304,5888164.1416001);
		        var a3 = new OpenLayers.Geometry.Point(1242740.6956021278,5888173.696228666);
		        var a13 = new OpenLayers.Geometry.Point(1242629.6230453,5888385.092385);
		        var aan = new OpenLayers.Geometry.MultiPoint([a3,a4,a5,a6,a7,a8,a9,a10,a11,a12]);
		        var pointFeature = new OpenLayers.Feature.Vector(aan, null, styleMap);
		        return pointFeature;
		}
	},
	getTappeinerZugang : function(){
        	var zugangMap = new OpenLayers.StyleMap({
               		strokeColor: 'orange',
               		strokeWidth: 5,
        	});
        	var route = new OpenLayers.Layer.Vector("zugang", {
               		strategies: [new OpenLayers.Strategy.Fixed()],
               		protocol: new OpenLayers.Protocol.HTTP({
                       		url: "kml/tappzu.kml",
                       		format: new OpenLayers.Format.KML({
                               		extractStyles: true,
                               		extractAttributes: true,
                               		maxDepth: 2
                       		})
               		}),
               		preFeatureInsert: function(feature) {
                       		feature.geometry.transform(new OpenLayers.Projection("EPSG:4326"),defaultProjection);
               		},
               		styleMap: zugangMap
        	});
        	return route;
    	},
	getSpurenEagles : function(){
        	var styleMap = {
			externalGraphic: 'images/Themenwege/parcours_adler.svg',
		        graphicWidth: 35,
		        graphicYOffset:-35.75
		};
		var a1 = new OpenLayers.Geometry.Point(1242547.1976388, 5888946.4435471);
		var a2 = new OpenLayers.Geometry.Point(1242807.5612664, 5888848.5086046);
		var a3 = new OpenLayers.Geometry.Point(1242830.2535091, 5888830.5936761);
		var a4 = new OpenLayers.Geometry.Point(1242940.1317373, 5888761.3226192);
		var a5 = new OpenLayers.Geometry.Point(1243299.6246359, 5888601.2825912);
		var a6 = new OpenLayers.Geometry.Point(1243254.2457289, 5888547.5322271);
		var adler = new OpenLayers.Geometry.MultiPoint([a1,a2,a3,a4,a5,a6]);
		var pointFeature = new OpenLayers.Feature.Vector(adler, null, styleMap);
		return pointFeature;
	},
	getArtPoints :function(){
	        var styleMap = new OpenLayers.StyleMap({
			externalGraphic: 'images/Themenwege/parcours_bueste.svg',
        		graphicWidth: 35,
		        graphicYOffset:-35.75
		});
		var point = new OpenLayers.Geometry.Point(1242010.4917555, 5888330.0435492);
		var pointFeature = new OpenLayers.Feature.Vector(point, null, null);
		var vectorLayer = new OpenLayers.Layer.Vector("artLayer",{
                	styleMap:styleMap
		});
		vectorLayer.addFeatures([pointFeature]);
		vectorLayer.events.on({
			"featureselected":function(e){
	                	$(".modal").hide();
                        	$("#artModal").show();
	                }
        	});
        	return vectorLayer;
    	},
	getRoutes: function(){
        		var theme,hike;
        		function displayRoutesList(){
        	        	var list = '';
	                	hike = $("#hike").hasClass("disabled");
                		theme = $("#theme").hasClass("disabled");
                		var sortedroutes = myroutes.sort(function(obj1, obj2) {
        	                	var f = obj1.displayName[lang].toLowerCase();
	                        	var s = obj2.displayName[lang].toLowerCase();
	                        	return ((f < s) ? -1 : ((f > s) ? 1 : 0));;
        	        	});
                		$.each(sortedroutes,function(index,value){
        	                	if ((theme != false && value.type=="themenweg")||(hike != false && value.type=="wanderweg"))
	                                	return true;
	                        	list+='<a href="#" title=""  id="'+value.id+'"class="list-route"><li>';
        	        	        list+='<h4>'+value.displayName[lang]+'</h4>';
                		        list+='<div class="metadata clearfix">';
        	                	list+='<div class="time">'+moment.duration(value.data,'seconds').humanize()+'</div>';
		                        list+='<div class="distance">'+(Math.round(value.distance)/1000).toString().replace('.',',')+' km </div>';
        	                	list+='<div class="drop">'+Math.round(value.altitude)+' hm </div>';
                		        list+='<div class="kcal"> '+value.kcal+' kCal</div>';
                	        	list+='</div>';
		                        list+='</li></a>';
	        	        });
                		$(".walking .routes-list").html(list);
	        	        $(".walking").height($( window ).height()-$("#header").outerHeight());
        		        $(".list-route").click(function(){
	                	        var id = $(this).attr("id");
                        		wegeStartPointsLayer.getRouteProfile(id);
	                	});
        		}
        		function loadRoutes(url){
                		$.ajax({
        	            		type: 'GET',
	                    		crossDomain: true,
                    			url: url,
		        	            dataType: 'json',
                			    success: function(response, status, xhr) {
				                    myroutes = response;
	                        		    displayRoutesList();
        	            	           },
	                    		   error: function(xhr, status, error) {
                        	   		console.log(error);
                    			   }
                		});
        		}
		        var url = SASABus.config.apiediEndPoint+"/get-routes";
       			if (myroutes== undefined){
                  		$(".walking .main-config .toggler").click(function(evt){
                         		$(this).toggleClass("disabled");
	                        	displayRoutesList();
        	        	});
		                loadRoutes(url);
			}
        		else
                		displayRoutesList();
	},
	addRouteLayer : function(obj){
		var coordinates=obj.data.route.path.coordinates
		var pointList = [];
		$.each(coordinates,function(index,value){
        		var point = new OpenLayers.Geometry.Point(value.coordinate[0],value.coordinate[1]);
        		pointList.push(point);
		});
		var styleMap = {
        		strokeColor: '#d35400',
        		strokeWidth: 6,
		};
		var lineFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(pointList),null,styleMap);
		var vectorLayer = new OpenLayers.Layer.Vector("routes");
		vectorLayer.addFeatures([lineFeature]);
		var zugang = SASABus.map.getLayersByName("zugang");
		removeLayers(zugang);
		if (obj.displayName.de=='Spurenweg')
        		vectorLayer.addFeatures([wegeStartPointsLayer.getSpurenEagles()]);
		else if (obj.displayName.de.indexOf('Spring 2015')>=0)
        		vectorLayer.addFeatures([wegeStartPointsLayer.getArtAndNature()]);
		else if (obj.displayName.de.indexOf('Tappeiner')>=0)
        		SASABus.map.addLayer(wegeStartPointsLayer.getTappeinerZugang());
		var layers =SASABus.map.getLayersByName("routes");
		removeLayers(layers);
		SASABus.map.addLayer(vectorLayer);
		SASABus.map.zoomToExtent(vectorLayer.getDataExtent());
		function removeLayers(layers){
        		$.each(layers,function(index,layer){
				SASABus.map.removeLayer(layer);
				layer.removeAllFeatures();
			});
		}
	},
	getRouteProfile : function(route){
		$.ajax({
    			type: 'GET',
    			crossDomain: true,
    			url: SASABus.config.apiediEndPoint+"/get-route?route="+route,
    			dataType: 'json',
    			success: function(response, status, xhr) {
        			displayRouteMetaData(response);
        			wegeStartPointsLayer.addRouteLayer(response);
    			},
    			error: function(xhr, status, error) {
        			console.log(error);
    			}
		});

		function drawRoutProfileAsArea(obj){
          		var visualization = new google.visualization.AreaChart(document.getElementById('highChart'));
          		visualization.draw(dataTable,options);
		}
		function drawRouteProfile(obj){
        		var chart = new google.visualization.LineChart(document.getElementById('highChart'));
        		var options = {
          			title: jsT[lang].altitudep,
          			curveType: 'function',
          			legend: { position: 'bottom' },
          			width:'100%',
          			height: '100%',
          			backgroundColor:'none',
          			vAxis: {
            				gridlines: {
                				color: 'transparent'
            				}
          			},
          			hAxis: {
            				ticks:'none',
            				gridlines: {
                				color: 'transparent'
            				}
          			},
          			colors:['#ce5400']
        		};
        		var dataArray =[['Distance',jsT[lang].altitude]];
        		$.each(obj.data.route.altitude_profile,function(index,value){
                		var valueArray = [];
                		valueArray[0] = value.distance;
                		valueArray[1] = value.altitude;
                		dataArray.push(valueArray);
        		});
        		var data = google.visualization.arrayToDataTable(dataArray);
        		chart.draw(data,options);
		}
		function displayRouteMetaData(obj){
        		$('.walk-route .title').html("<h3>"+obj.displayName[lang]+"</h3>");
        		$('.walk-route .metadata .time').text(moment.duration(obj.data.route.time,'seconds').humanize());
        		$('.walk-route .metadata .distance').text((Math.round(obj.data.route.distance)/1000).toString().replace('.',',') +' km');//obj.data.route.altitude_profile[obj.data.route.altitude_profile.length-1].distance
        		$('.walk-route .metadata .drop').text(Math.round(obj.data.route.pos_altitude_difference) +' hm');
        		$('.walk-route .metadata .kcal').text(obj.kcal+' kCal');
        		$('.walk-route a.more').attr('href',obj.url);
        		drawRouteProfile(obj);
        		$('.modal').hide();
        		$('.walk-route').show();
        		google.setOnLoadCallback(drawRouteProfile(obj));
		};
	}
}

var stopsLayer = {
  isCached : true,
	get : function(){
		if (this.isCached && this.layer != undefined)
		return this.layer;
		var styleMap = new OpenLayers.StyleMap({
			pointRadius: 6,
			strokeColor: '#000000',
			strokeWidth: 2,
			fillColor: '#FFFFFF'
		});
		var positionLayer = new OpenLayers.Layer.Vector('stopsLayer', {
			strategies: [new OpenLayers.Strategy.Fixed()],
			protocol: new OpenLayers.Protocol.Script({
				url: SASABus.config.r3EndPoint + "stops",
				callbackKey: "jsonp"
			}),
			preFeatureInsert: function(feature) {
				feature.geometry.transform(epsg25832,defaultProjection);
			},
			styleMap: styleMap,
			minScale:10000,
		});
		positionLayer.events.on({
			"beforefeatureselected":function(e){
				showStopPopup(e.feature);
			}
		});
		this.layer = positionLayer;
		return this.layer;

		function showStopPopup(feature) {
			lonLat = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y),
			pixel = SASABus.map.getPixelFromLonLat(lonLat);

			if(!busPositionLayer.tpl.stopRow) {
				var tr = $(SASABus.config.stopPopupSelector + ' table tbody tr');
				busPositionLayer.tpl.stopRow = tr.clone().wrap('<div>').parent().html();
				tr.remove();
				busPositionLayer.tpl.stopContent = $(SASABus.config.stopPopupSelector).html();
			}

			var url = SASABus.config.r3EndPoint + feature.attributes.ort_nr + '.' + feature.attributes.onr_typ_nr + '/buses';

			$.ajax({
				type: 'GET',
				url: url,
				dataType: 'jsonp',
				crossDomain: true,
				jsonp: 'jsonp',
				success: function(response) {
					if(!response || typeof(response) != 'object' || typeof(response.length) == 'undefined') {
						return SASABus.alert('System Error');
					}
					return busPositionLayer.showTplPopup('stop', feature, response, pixel,'.stop-position');
				},
				error: function() {
					return SASABus.alert('System Error');
				}
			});

			return false;
		}
		function zoomToStop(ort_nr, onr_typ_nr) {
			len = stopsLayer.get().features.length,i, feature, zoomFeature;
			for(i = 0; i < len; i++) {
				feature = stopsLayer.features[i];
				if(feature.attributes.ort_nr == ort_nr && feature.attributes.onr_typ_nr == onr_typ_nr ) {
					zoomFeature = feature;
					var lonLat = new OpenLayers.LonLat(zoomFeature.geometry.x, zoomFeature.geometry.y);
					SASABus.map.moveTo(lonLat);
					showStopPopup(zoomFeature);
				}
			}
		}
	}
}
var busPositionLayer = {
	isCached : true,
	tpl: {
		busRow: undefined,
		busContent: undefined,
		stopRow: undefined,
		stopContent: undefined
	},
	updateBusTimeout:undefined,
	showTplPopup:function(type, selectedFeature, features, position, type_id) {
		var contentTpl = (type == 'bus') ? busPositionLayer.tpl.busContent : busPositionLayer.tpl.stopContent,
		rowTpl = (type == 'bus') ? busPositionLayer.tpl.busRow : busPositionLayer.tpl.stopRow,
		selector = (type == 'bus') ? SASABus.config.busPopupSelector : SASABus.config.stopPopupSelector,
		content = OpenLayers.String.format(contentTpl, selectedFeature.attributes),pixel;
		$(selector).empty().html(content);
		$('#bus-pop-img').attr('src','images/'+selectedFeature.attributes.hexcolor2+'.png');
		if(features.length > 0) {
			var rows = [],
			len = (features.length > SASABus.config.rowsLimit) ? SASABus.config.rowsLimit : features.length,
			i, row, number;

			for(i = 0; i < len; i++) {
				row = features[i];
				if(row.geometry && row.properties) row = row.properties;
				number = (i + 1);
				row.odd = (number % 2 == 1) ? 'odd' : '';
				row.last = (number == (len)) ? 'last' : '';
				rows.push(OpenLayers.String.format(rowTpl, row));
			}
			$('.modal').hide();
			$(selector + ' table tbody').append(rows.join());
			$(selector + ' table').show();
			$(selector + ' .noData').hide();
		} else {
			$(selector + ' table').hide();
			$(selector + ' .noData').show();
		}
		$(type_id).show();
	},
	get : function(){
		if (this.isCached && this.layer != undefined)
		return this.layer;
		var styleMap = new OpenLayers.StyleMap({
			pointRadius: 12,
			externalGraphic: 'images/${hexcolor2}.png'
		});
		var positionsLayer = new OpenLayers.Layer.Vector("positionLayer", {
			strategies: [new OpenLayers.Strategy.Fixed()],
			protocol: new OpenLayers.Protocol.Script({
				url: SASABus.config.r3EndPoint + "positions",
				callbackKey: "jsonp"
			}),
			preFeatureInsert: function(feature) {
				feature.geometry.transform(epsg25832,defaultProjection);
			},
			styleMap: styleMap
		});
		positionsLayer.events.on({
			"beforefeatureselected":function(e){
				showBusPopup(e.feature);
			}
		});
		positionsLayer.events.register('loadend', positionsLayer, function(e) {
			var interval = 2500;
			if(busPositionLayer.updateBusTimeout) window.clearTimeout(busPositionLayer.updateBusTimeout);
			busPositionLayer.updateBusTimeout = window.setTimeout(function() {
				positionsLayer.refresh();
			}, interval);
		});
		this.layer = positionsLayer;
		linesLayer.showLines(['all']);
		return this.layer;

		function showBusPopup(feature) {
			var x = feature.geometry.x,
			y = feature.geometry.y,
			lonLat = new OpenLayers.LonLat(x, y),
			pixel = SASABus.map.getPixelFromLonLat(lonLat);
			if(!busPositionLayer.tpl.busRow) {
				var tr = $(SASABus.config.busPopupSelector + ' table tbody tr');
				busPositionLayer.tpl.busRow = tr.clone().wrap('<div>').parent().html();
				tr.remove();
				busPositionLayer.tpl.busContent = $(SASABus.config.busPopupSelector).html();
			}
			var url = SASABus.config.r3EndPoint + feature.attributes.frt_fid + '/stops';
			$.ajax({
				type: 'GET',
				url: url,
				dataType: 'jsonp',
				crossDomain: true,
				jsonp: 'jsonp',
				success: function(response) {
					if(!response || typeof(response) != 'object' || !response.features || typeof(response.features.length) == 'undefined') {
						return SASABus.alert('System Error');
					}
					showTplPopup('bus', feature, response.features, pixel,'.bus-position');
				},
				error: function() {
					return SASABus.alert('System Error');
				}
			});
			return false;
		}
		function showTplPopup(type, selectedFeature, features, position, type_id) {
			var contentTpl = (type == 'bus') ? busPositionLayer.tpl.busContent : busPositionLayer.tpl.stopContent,
			rowTpl = (type == 'bus') ? busPositionLayer.tpl.busRow : busPositionLayer.tpl.stopRow,
			selector = (type == 'bus') ? SASABus.config.busPopupSelector : SASABus.config.stopPopupSelector,
			content = OpenLayers.String.format(contentTpl, selectedFeature.attributes),pixel;
			$(selector).empty().html(content);
			$('#bus-pop-img').attr('src','images/'+selectedFeature.attributes.hexcolor2+'.png');
			if(features.length > 0) {
				var rows = [],
				len = (features.length > SASABus.config.rowsLimit) ? SASABus.config.rowsLimit : features.length,
				i, row, number;

				for(i = 0; i < len; i++) {
					row = features[i];
					if(row.geometry && row.properties) row = row.properties;
					number = (i + 1);
					row.odd = (number % 2 == 1) ? 'odd' : '';
					row.last = (number == (len)) ? 'last' : '';
					rows.push(OpenLayers.String.format(rowTpl, row));
				}

				$('.modal').hide();
				$(selector + ' table tbody').append(rows.join());
				$(selector + ' table').show();
				$(selector + ' .noData').hide();
			} else {
				$(selector + ' table').hide();
				$(selector + ' .noData').show();
			}

			$(type_id).show();
		}
	}
}
var linesLayer = {
	isCached : true,
	get : function(){
		if (this.isCached && this.layer != undefined)
		return this.layer;
		var positionsLayer = new OpenLayers.Layer.WMS('SASA Linee', SASABus.config.r3EndPoint + 'ogc/wms', {layers: 0, transparent: true,isBaseLayer:false}, {projection:defaultProjection.projCode
			,visibility: true, singleTile: true});
			this.layer = positionsLayer;
			return this.layer;
		},
		getAllLines: function(success, failure, scope) {
			scope = scope || null;
			failure = failure || function() {};
			if(!success) return console.log('success callback is mandatory when calling getAllLines');
			$.ajax({
				type: 'GET',
				crossDomain: true,
				url: SASABus.config.r3EndPoint + 'lines/all',
				dataType: 'jsonp',
				jsonp: 'jsonp',
				success: function(response, status, xhr) {
					if(!response) failure.call(scope, xhr, status, response);
					success.call(scope, response);
				},
				error: function(xhr, status, error) {
					failure.call(scope, xhr, status, error);
				}
			});
		},
		getLines: function(success, failure, scope) {
			scope = scope || null;
			failure = failure || function() {};
			if(!success) return console.log('');
			if(this.lines) return success.call(scope, this.lines);

			$.ajax({
				type: 'GET',
				crossDomain: true,
				url: SASABus.config.r3EndPoint + 'lines?city='+SASABus.config.city,
				dataType: 'jsonp',
				jsonp: 'jsonp',
				success: function(response, status, xhr) {
					if(!response) failure.call(scope, xhr, status, response);
					SASABus.lines = response;
					success.call(scope, SASABus.lines);
				},
				error: function(xhr, status, error) {
					failure.call(scope, xhr, status, error);
				}
			});
		},

		showLines: function(lines) {
			var visibility = true;
			if(!lines || !lines.length) {
				lines = [0];
				visibility = false;
			}
			if(!visibility) linesLayer.get().setVisibility(visibility);
			linesLayer.get().mergeNewParams({layers: lines});
			if(visibility) linesLayer.get().setVisibility(visibility);
			if(lines.length > 0 && lines[0] != 'all') {
				busPositionLayer.get().protocol.options.params = {lines:lines};
			} else {
				delete busPositionLayer.get().protocol.options.params;
			}
			if(this.updateBusTimeout) window.clearTimeout(this.updateBusTimeout);
			busPositionLayer.get().refresh();
			if(lines.length > 0 && lines[0] != 'all') {
				stopsLayer.get().protocol.options.params = {lines:lines};
			} else {
				delete stopsLayer.get().protocol.options.params;
			}
			stopsLayer.get().refresh();
		}
	}

var jsT= {
	de:{
		altitudep:'Höhenprofil',
		altitude:'Höhenmeter',
		freeBikes:'Freie Fahrräder',
		freeCars:'Verfügbare Autos',
		freeCharger:'Verfügbare Ladestationen',
		charger:'Ladeplatz',
		mountain_bike_adult:'Mountain bike',
		city_bike_adult_with_gears:'City bike für Erwachsene',
		mountain_bike_teenager:'Mountain bike für Jugendliche',
		mountain_bike_child:'Mountain bike für Kinder',
		city_bike_adult_without_gears:'City bike für Erwachsene ohne Gangschaltung',
		chargingStates:{
			1:'Verfügbar',
			2:'Besetzt',
			3:'Reserviert',
			4:'Außer Dienst'
		},
		backtomap:'zur Kartenansicht',
		chargerOnline:'Ladestation in Betrieb',
		outOfOrder:'Ladestation momentan außer Betrieb',
		paymentInfo:'Wie bezahle ich?',
		book:'Reservieren',
		deselectAll:'Alle ausblenden',
		selectAll:'Alle anzeigen',
		availableParkingSpaces:'Freie Parkplätze',
		capacity:'Kapazität',
		phone:'Tel.',
		disabledtoilet:'Behindertentoilette verfügbar',
		disabledcapacity:'Kapazität Behindertenparkplätze',
		operator:'Betreiber',
		startAddressLabel:'Startpunkt',
		destinationHubLabel:'Ankunftshub',
		pendularLabel:'Pendler',
		nonPendularLabel:'Gelegenheitsfahrer',
		arrivalTimeLabel:'Hinfahrt',
		departureTimeLabel:'Rückfahrt',
                passengerRequests:'Mitfahrer Anfragen',
                driverRequests:'Fahrer Anfragen',
                driver:'Fahrer',
                passenger:'Mitfahrer',
	},
	it:{
		altitudep:'Profilo altimetrico',
		altitude:'Altitudine',
		freeBikes:'Bici disponibili',
		freeCars:'Macchine disponibili',
		freeCharger:'Posti di ricarica disponibili',
		charger:'Posto di ricarica',
		mountain_bike_adult:'Mountain bike',
		city_bike_adult_with_gears:'City bike per adulti',
		mountain_bike_teenager:'Mountain bike per adolescenti',
		mountain_bike_child:'Mountain bike per bambini',
		city_bike_adult_without_gears:'City bike per adulti senza cambio',
		chargingStates:{
			1:'Disponibile',
			2:'Occupato',
			3:'Prenotato',
			4:'Fuori servizio'
		},
		backtomap:'Torna alla mappa',
		chargerOnline:'Stazione di ricarica attiva',
		outOfOrder:'Stazione fuori servizio',
		paymentInfo:'Come posso pagare?',
		book:'Prenota',
		deselectAll:'Deseleziona tutti',
		selectAll:'Seleziona tutti',
		availableParkingSpaces:'Parcheggi liberi',
		capacity:'Capienza',
		phone:'T.',
		disabledtoilet:'Bagno per disabili disponibile',
		disabledcapacity:'Capienza parcheggi disabili',
		operator:'Operatore',
		startAddressLabel:'Indirizzo di partenza',
		destinationHubLabel:'Per hub',
		nonPendularLabel:'Utente occasionale',
		pendularLabel:'Pendolare',
		arrivalTimeLabel:'Andata',
		departureTimeLabel:'Ritorno',
                passengerRequests:'Richiesta autisti',
                driverRequests:'Richiesta passeggeri',
                driver:'Autista',
                passenger:'Passeggero',
	},
	en:{
		altitudep:'Altitude profile',
		altitude:'Altitude',
		freeBikes:'Available bikes',
		freeCars:'Available cars',
		freeCharger:'Available Chargingstations',
		charger:'Chargingslot',
		mountain_bike_adult:'Mountain bike',
		city_bike_adult_with_gears:'City bike for adults',
		mountain_bike_teenager:'Mountain bike for teenager',
		mountain_bike_child:'Mountain bike for children',
		city_bike_adult_without_gears:'City bike for adults without gears',
		chargingStates:{
			1:'Available',
			2:'Occupied',
			3:'Reserved',
			4:'Out of order'
		},
		backtomap:'Back to map',
		chargerOnline:'Chargingstation online',
		outOfOrder:'Currently out of order',
		paymentInfo:'Payment info',
		book:'Book',
		deselectAll:'Deselect all',
		selectAll:'Select all',
		availableParkingSpaces:'Available parking spaces',
		capacity:'Capacity',
		phone:'Phone:',
		disabledtoilet:'Disabled toilet available',
		disabledcapacity:'Capacity disabled parking spaces',
		operator:'Operator',
		startAddressLabel:'Starting point',
		destinationHubLabel:'To hub',
		pendularLabel:'Pendular',
		nonPendularLabel:'Occasional user',
		arrivalTimeLabel:'Planned arrival',
		departureTimeLabel:'Return trip',
                passengerRequests:'Passenger requests',
                driverRequests:'Driver requests',
                driver:'Driver',
                passenger:'Passenger',
	}

}

var defaultConfig = {
	integreenEndPoint:'https://ipchannels.integreen-life.bz.it/'
}

var integreen = {
	cache:{},
	getStationDetails : function(frontEnd,config,callback){
		if (config){
			var keys = Object.keys(config);
			for (i in keys){
				defaultConfig[keys[i]] = config[keys[i]];
			}
		}
		var cachedData = integreen.cache[frontEnd];
		if (cachedData)
		callback(cachedData)
		else
		$.ajax({
			url : defaultConfig.integreenEndPoint + frontEnd + 'get-station-details',
			dataType : 'json',
			crossDomain: true,
			success : function(data) {
				integreen.cache[frontEnd]=data;
				callback(data);
			}
		});
	},
	retrieveData: function(station,frontEnd,callback,config){
		this.getStationDetails(frontEnd,config,filterStation);
		function filterStation(data){
			for (i in data){
				if (data[i].id == station || data[i].parent == station){
					integreen.getCurrentData(data[i],frontEnd,callback,config);
				}
			}
		}
	},
	getCurrentData: function(stationDetails,frontEnd,callback,config){
		var currentState = {};
		if (config && config.types){
			var types = config.types.slice();
			getData(types);
		}
		else
		$.ajax({url:defaultConfig.integreenEndPoint + frontEnd + 'get-data-types?station='+stationDetails.id,success: function(datatypes){
			getData(datatypes);
		}});
		function getData(types){
			if (types.length==0){
				callback(stationDetails,currentState);
				return;
			}
			var type = types.pop()[0];
			var params ={station:stationDetails.id,type:type};
			$.ajax({
				url : defaultConfig.integreenEndPoint + frontEnd + 'get-newest-record?'+$.param(params),
				dataType : 'json',
				crossDomain: true,
				success : function(result) {
					if (result.value != undefined)
					currentState[type] = result;
					getData(types);
				}
			});
		}
	},
	getChildStationsData : function(station,frontEnd,callback,config){
		var children = [];
		var dtos = [];
		this.getStationDetails(frontEnd,config,filterStation);
		function filterStation(data){
			for (i in data){
				if (data[i].parentStation == station)
				children.push(data[i]);
			}
			retrieveRecursively(children);
			function retrieveRecursively(){
				if (children.length <= 0)
				callback(dtos);
				var child = children.pop();
				if (child)
				integreen.retrieveData(child.id,frontEnd,addData,config);
			}
			function addData(details,newestRecord){
				var child = {
					detail:details,
					newestRecord:newestRecord
				}
				dtos.push(child);
				retrieveRecursively();
			}
		}
	}
}

var echargingLayer = {
	isCached:true,
	getTypes : function(callback){
		var details;
		integreen.getStationDetails('EchargingFrontEnd/rest/',{},getChargingDetails);
		function getChargingDetails(data){
			details = data;
			integreen.getStationDetails('EchargingFrontEnd/rest/plugs/',{},displayBrands);
		}
		function displayBrands(data){
			var brands = {
				nothingSelected : function(){
					var selected = true;
					for (i in brands){
						if (brands[i]==true)
						selected = false;
					}
					return selected;
				}
			};
			var provider = {};
			var accessType = {};
			$.each(data,function(index,value){
				$.each(value.outlets,function(i,outlet){
					if (typeof value != 'function')
					brands[outlet.outletTypeCode] = true;
				});
			});
			$.each(details,function(index,value){
				if (value.provider)
				provider[value.provider] = true;
				if (value.accessType)
				accessType[value.accessType] = true;
			});
			$('.emobility .deselect-all').click(function(){
				var nothingSelected = brands.nothingSelected();
				if (!nothingSelected)
				$('.emobility .toggler').addClass('disabled');
				else
				$('.emobility .toggler').removeClass('disabled');
				Object.keys(accessType).forEach(function(v){accessType[v] = nothingSelected});
				Object.keys(provider).forEach(function(v){provider[v] = nothingSelected});

				$.each(brands,function(index,value){
					if (typeof value != 'function')
					brands[index] = nothingSelected;
				});
				var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
				$('.emobility .deselect-all').text(statusText);
				echargingLayer.retrieveStations(brands,provider,accessType);
			});
			if (callback != undefined)
			callback(brands,provider,accessType);
			$('.echargingtypes').empty();
			$('.emobility .echargingtypes').append('<li class="type-header">Plugtypes</li><hr/>');
			var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
			$('.emobility .deselect-all').text(statusText);
			var svg = '<svg width="55" height="30">'
				+       '<g>'
				+               '<rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#f2bf00" height="24"/>'
				+               '<circle cx="34" cy="17" r="9" fill="#f2bf00" />'
				+       '</g>'
				+       'Sorry, your browser does not support inline SVG.'
				+ '</svg>';
			$.each(brands,function(index,value){
				if (typeof value == 'function')
				return true;
				$('.emobility .echargingtypes').append('<li class="clearfix echargingbrand"><p>'+index+'</p><a brand='+escape(index)+' href="javascript:void(0)" class="toggler">'+ svg + '</a></li>');
			});
			$('.emobility .echargingtypes').append('<li class="type-header">Provider</li><hr/>');
			$.each(provider,function(index,value){
				$('.emobility .echargingtypes').append('<li class="clearfix echargingbrand"><p>'+index+'</p><a brand='+escape(index)+' href="javascript:void(0)" class="toggler">'+ svg + '</a></li>');
			});
			$('.emobility .echargingtypes').append('<li class="type-header">AccessType</li><hr/>');
			$.each(accessType,function(index,value){
				$('.emobility .echargingtypes').append('<li class="clearfix echargingbrand"><p>'+index+'</p><a brand='+escape(index)+' href="javascript:void(0)" class="toggler">'+ svg + '</a></li>');
			});
			$('.echargingbrand a').click(function(e){
				var brand = unescape($(this).attr("brand"));
				if (brand in brands)
					brands[brand] = !brands[brand];
				else if (brand in provider)
					provider[brand] = !provider[brand];
				else if (brand in accessType)
					accessType[brand] = !accessType[brand];
				$(this).toggleClass("disabled");
				var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
				$('.emobility .deselect-all').text(statusText);
				echargingLayer.retrieveStations(brands,provider,accessType);
			});
	}
},
populate: function(){
	var self = this;
	if (self.brands == undefined)
	self.getTypes(self.retrieveStations);
},
retrieveStations : function(brands,provider,accessType){
	function adaptToGeoserver(brands){
		var brandreq='\'undefined\'';
		if (brands)
		$.each(brands,function(index,value){
			if (value){
				if (brandreq != '')
				brandreq += "\\,";
				brandreq += '\''+index+'\'';
			}
		});
		return brandreq;
	}
	var brandreq = adaptToGeoserver(brands);
	var providerArray = adaptToGeoserver(provider);
	var accessTypeArray = adaptToGeoserver(accessType);
	var  params = {
		request:'GetFeature',
		typeName:'edi:Echarging',
		outputFormat:'text/javascript',
		format_options: 'callback: jsonCharging'
	};
	if (brandreq != '')
	params['viewparams']='brand:'+brandreq+';provider:'+providerArray+';accessTypes:'+accessTypeArray+';';

	$.ajax({
		url : SASABus.config.geoserverEndPoint+'wfs?'+$.param(params),
		dataType : 'jsonp',
		crossDomain: true,
		jsonpCallback : 'jsonCharging',
		success : function(data) {
			var features = new OpenLayers.Format.GeoJSON().read(data);
			echargingLayer.layer.removeAllFeatures();
			echargingLayer.layer.addFeatures(features);
		},
		error : function() {
			console.log('problems with data transfer');
		}
	});
},
get: function(){
	if (this.isCached && this.layer != undefined)
	return this.layer;
	var styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({
		externalGraphic: '${externalGraphic}',
		graphicWidth: 35,
		graphicYOffset:-35.75,
	},{
		context: {
			externalGraphic:function(feature){
				var pin= 'images/8_Echarging/marker.svg';
				if (!feature.cluster){
					var max = feature.attributes.chargingpointscount;
					var now = feature.attributes.value;
					var a = now/max;
					if (a == 0.)
					pin= 'images/8_Echarging/marker_red.svg';
					else if (a>0 && a <= 0.6)
					pin= 'images/8_Echarging/marker_orange.svg';
					else if (a>=0.6)
					pin= 'images/8_Echarging/marker_green.svg';
				}
				return pin;
			}
		}
	}));

	var positionsLayer = new OpenLayers.Layer.Vector("echargingLayer", {
		styleMap: styleMap,
		strategies: [new OpenLayers.Strategy.Cluster({distance: 25,threshold: 2})],
	});
	positionsLayer.events.on({
		"featureselected":function(e){
			if (!e.feature.cluster){
				var station = e.feature.attributes.stationcode;
				integreen.retrieveData(station,"EchargingFrontEnd/rest/",displayData);
			}
			else{
				var cluster = e.feature.cluster;
				var allTheSame = true;
				var firstElement = cluster[0];
				for(i=1;i<cluster.length;i++){
					if (firstElement.geometry.x != cluster[i].geometry.x || firstElement.geometry.y != cluster[i].geometry.y){
						allTheSame = false;
						break;
					}
				}
				if (!allTheSame){
					var vectors = new OpenLayers.Layer.Vector("vector", {isBaseLayer: false});
					vectors.addFeatures(cluster);
					var dataExtent = vectors.getDataExtent();
					SASABus.map.setCenter(e.feature.geometry.bounds.centerLonLat);
					SASABus.map.zoomToExtent(dataExtent);
				}else
					displayFeatureInfo(cluster);
			}
		}
	});
	function displayFeatureInfo(cluster){
		$('.station .title').html('Found multiple charging points');
		var html = '<div class="info"><ul></ul></div>'
		$('.station .content').html(html);
		cluster.forEach(function(value,index){
			var id = value.id;
			$('.station .content .info ul').append('<li><a href="javascript:void(0)" class="echargingpointd'+id+'">'+value.attributes.stationname+'</a></li>');

			$('.station .content ul .echargingpointd'+id).click(function(){
				integreen.retrieveData(value.attributes.stationcode,"EchargingFrontEnd/rest/",displayData);
			});

		});
		$('.station').show();

	}
	this.layer = positionsLayer;
	return positionsLayer;

	function displayData(details,state){
		var updatedOn = moment(state['number-available'].timestamp).locale(lang).format('lll');
		$('.station .title').html("<small>Station name: </small>"+details.name.replace("CU_","")+"<br/><small>Operator:</small> "+details.provider+"<br/><small>"+updatedOn+"</small>");
		if (details.state == 'FAULT' || details.state == 'UNAVAILABLE'){
			$(".content").html('<h3>'+jsT[lang].outOfOrder+'</h3><div><a href="javascript:void(0)" class="backtomap ibutton" ><div>'+jsT[lang].backtomap+'</div></a><hr/></div>');
			$('.station .backtomap.ibutton').click(function(){
				$('.modal').hide();
			});
			$('.modal').hide();
			$('.station').show();
			return;
		}
		var html = "";
		html+="<div class='number-available'></div>";
		html+="<div class='caption'>"+jsT[lang].freeCharger+"</div><hr/>";
		if (details.address)
		html+='<div class="info address"><a title="Routing by Google" href="https://maps.google.com?saddr=Current+Location&mode=driving&daddr='+details.latitude+","+details.longitude+'" target="_blank">'+details.address+"</a></div>";
		if (details.accessType)
		html+='<div class="info">'+details.accessType+'</div>';
		if (details.categories && details.categories.length>0)
		html+='<div class="info">'+details.categories.join(', ')+'</div>';
		if (details.accessInfo && !details.flashInfo)
		html += "<div class='info'><img src='images/8_Echarging/online.svg' width='30px'/><span>"+jsT[lang].chargerOnline+"</span><p>" + details.accessInfo+"</p></div><hr/>";
		else if (details.flashInfo)
		html += "<div class='info'><img src='images/8_Echarging/maintanance.svg' width='30px'/><span>"+details.flashInfo+"</span></div>";
		if (details.paymentInfo)
		html+='<div><a href="' + details.paymentInfo + '" target="_blank" class="backtomap ibutton" ><div>'+jsT[lang].paymentInfo+'</div></a></div>';
		if (details.reservable)
		html+='<div><a href="' + details.paymentInfo + '" target="_blank" class="backtomap ibutton" ><div>'+jsT[lang].book+'</div></a></div>';
		html += "</div>";
		html+='<div><a href="javascript:void(0)" class="backtomap ibutton" ><div>'+jsT[lang].backtomap+'</div></a><hr/></div>';
		integreen.getChildStationsData(details.id,"EchargingFrontEnd/rest/plugs/",displayPlugs);
		function displayPlugs (children){
			$.each(children,function(index,value){
				var plugState = value.newestRecord;
				var plugDetails = value.detail;
				var state = plugState['echarging-plug-status'].value;
				if (state == 1)
				plugColor='#8faf30';
				else if(state == 2 || state == 3)
				plugColor = '#f28e1e';
				else
				plugColor = '#e81c24';
				html += "<div class='plug clearfix'>"
				+"<h4><svg height='20' width='20'><circle cx='10' cy='10' r='10' fill='" + plugColor + "'></circle></svg>" + jsT[lang].charger + " "+(index+1)+"</h4>";
				$.each(value.detail.outlets,function(i,outlet){
					html += "<div class='clearfix outlet'><img src='https://service.aewnet.eu/e-mobility/api/v2/images/outlettypes/"+ outlet.outletTypeCode+"' alt='Plug image not available'/>"
					+"<p>"+outlet.outletTypeCode +" | "
					+ outlet.minCurrent + " - " + outlet.maxCurrent+" A | "
					+ outlet.maxPower +" W </p></div>";
				});
				html += "</div>"
			});
			$('.station .content').html(html);
			if (state['number-available'].value == details.capacity)
			$('.station .number-available').addClass("free");
			radialProgress($('.station .number-available')[0])
			.diameter(180)
			.value(state['number-available'].value)
			.maxValue(details.capacity)
			.render();

			$('.modal').hide();
			$('.station .backtomap.ibutton').click(function(){
				$('.modal').hide();
			});
			$('.station').show();
		}
	}
}
}

var bikeSharingLayer ={
	isCached:true,
	populate: function(){
                var self = this;
                if (self.brands === undefined)
                        self.getBikeBrands(self.retrieveStations);
	},
	getBikeBrands : function(callback){
		integreen.getStationDetails('bikesharingFrontEnd/rest/bikes/',{},displayBrands);
                function displayBrands(data){
                        var brands = {
				nothingSelected : function(){
                                        var selected = true;
          				var i;
                                        for (i in brands){
                                                if (brands[i]===true)
                                                        selected = false;
                                        }
                                        return selected;
                                }
			};
                        $.each(data,function(index,value){
                                brands[value.type] = true;
                        });
	                $.each(brands,function(index,value){
				if (typeof value == 'function')
                                        return true;
        	                $('.bike .biketypes').append('<li class="bikebrand clearfix"><p>'+jsT[lang][index.split("-").join("_")]+'</p><a brand='+index+' href="javascript:void(0)" class="toggler">'+
				'<svg width="55" height="30">'+
                                       '<g>'+
                                               '<rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#bb392b" height="24"/>'+
                                               '<circle cx="34" cy="17" r="9" fill="#bb392b" />'+
                                       '</g>'+
                                       'Sorry, your browser does not support inline SVG.'+
                                '</svg>'+
                                '</a></li>');

                	});
			var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
	                $('.bike .deselect-all').text(statusText);
                	$('.bikebrand a.toggler').click(function(e){
                        	var brand = $(this).attr("brand");
	                        brands[brand] = !brands[brand];
				$(this).toggleClass("disabled");
				var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
		                $('.bike .deselect-all').text(statusText);
                	        bikeSharingLayer.retrieveStations(brands);
	                });
                        $('.bike .deselect-all').click(function(){
	                        var nothingSelected = brands.nothingSelected();
				if (!nothingSelected)
                                        $('.bike .toggler').addClass('disabled');
                                else
                                        $('.bike .toggler').removeClass('disabled');

                                $.each(brands,function(index,value){
					if (typeof(value)!='function')
	                                        brands[index] = nothingSelected;
                                });
				var statusText = !nothingSelected ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
		                $('.bike .deselect-all').text(statusText);
                                bikeSharingLayer.retrieveStations(brands);
                        });
                        if (callback !== undefined)
                                callback(brands);

                }
	},
	retrieveStations : function(brands){
                var brandreq='';
                $.each(brands,function(index,value){
                        if (value){
                                if (brandreq !== '')
                                        brandreq += "\\,";
                                brandreq += '\''+index+'\'';
                        }
                });
                var  params = {
                        request:'GetFeature',
                        typeName:'edi:Bikesharing',
                        outputFormat:'text/javascript',
                        format_options: 'callback: getJson'
                };
                if (brandreq !== '')
                        params['viewparams']='brand:'+brandreq;
                $.ajax({
                        url : SASABus.config.geoserverEndPoint+'wfs?'+$.param(params),
                        dataType : 'jsonp',
                        crossDomain: true,
                        jsonpCallback : 'getJson',
                        success : function(data) {
                                var features = new OpenLayers.Format.GeoJSON().read(data);
                                bikeSharingLayer.layer.removeAllFeatures();
                                bikeSharingLayer.layer.addFeatures(features);
                        },
                        error : function() {
                                console.log('problems with data transfer');
                        }
                });
        },
	get: function(){
		if (this.isCached && this.layer !== undefined)
                        return this.layer;
		var styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({
		    externalGraphic: '${externalGraphic}',
		    graphicWidth: 35,
		    graphicYOffset:-35.75,
		},{
		    context: {
		        externalGraphic:function(feature){
		                var pin= 'images/5_Bike/marker.svg';
				if (!feature.cluster){
					var max = feature.attributes.max_available;
					var now = feature.attributes.value;
					var a = now/max;
					if (a === 0)
		        	        	pin= 'images/5_Bike/marker_red.svg';
					else if (a < 0.6 && a > 0)
			                	pin= 'images/5_Bike/marker_orange.svg';
					else if (a>=0.6)
		                		pin= 'images/5_Bike/marker_green.svg';
				}
		                return pin;
		        }
		    }
		}));

		var positionsLayer = new OpenLayers.Layer.Vector("bikeStationsLayer", {
			styleMap: styleMap,
			strategies:[new OpenLayers.Strategy.Cluster({distance:25,threshold: 2})]
		});
		positionsLayer.events.on({
		       	"featureselected":function(e){
				if (!e.feature.cluster){
					var station = e.feature.attributes.stationcode;
					$('.modal').hide();
				       	$('.bikesharingstation').show();
					integreen.retrieveData(station,"bikesharingFrontEnd/rest/",getCurrentBikesharingData);
				}else{
          var vectors = new OpenLayers.Layer.Vector("vector", {isBaseLayer: false});
          vectors.addFeatures(e.feature.cluster);
          var dataExtent = vectors.getDataExtent();
          SASABus.map.setCenter(e.feature.geometry.bounds.centerLonLat);
          SASABus.map.zoomToExtent(dataExtent);
        }
			}
		});
		function getCurrentBikesharingData(details,data){
			var updatedOn = moment(data['number-available'].timestamp).locale(lang).format('lll');
			$('.bikesharingstation .title').html(details.name+"<br/><small>"+updatedOn+"</small>");
              		$('.bikesharingstation #totalAvailable').empty();
			$('.bikesharingstation .legend').empty();
			$('.bike-categorys').empty();
			var config={
				types:[["availability","","Indicates if a vehicle is available for rental","300"]]
			}
                        integreen.getChildStationsData(details.id,"bikesharingFrontEnd/rest/bikes/",displayCurrentState,config);
			function displayCurrentState(bikes){
				if (bikes && bikes.length>0){
					var bikesByBrand = getAmountByBrand(bikes);
					$.each(bikesByBrand,function(key,value){
						var cat = key.split("-").join("_");
						if (key=="numberAvailable"){
							radialProgress(document.getElementById('totalAvailable'))
							.diameter(180)
							.value(value.current)
							.maxValue(details.bikes['number-available'])
							.render();
						$('.bikesharingstation #totalAvailable').removeClass("free");
			                        if  (details.bikes['number-available'] == value.current)
                        			        $('.bikesharingstation #totalAvailable').addClass("free");
						}
						else{
							var html ='<div class="clearfix">'
		                                                +'<div id="'+cat+'-container" class="number-available"></div>'
	                                                	+'<span></span>'
        	                                	+'</div>';
							$('.bike-categorys').append(html);
							radialProgress(document.getElementById(cat+'-container'))
							.diameter(78)
							.value(value.current)
							.maxValue(details.bikes[key])
							.render();
							$('#'+cat+'-container').next().text(jsT[lang][cat]);
							$('#'+cat+'-container').removeClass("free");
					                        if  (value.current == details.bikes[key])
                                					$('#'+cat+'-container').addClass("free");
						}
					});
					$('.bikesharingstation .caption').text(jsT[lang]['freeBikes']);
				}else{
					$('.bikesharingstation .legend').html("<p style='color:#000'>Station out of order</p>");
				}
			}
			function getAmountByBrand(children){
                                var amountByBrand = {numberAvailable:{current:0}};
                                $.each(children,function(index,value){
                                        var brand = value.detail.type;
                                        if (amountByBrand[brand] === undefined){
                                                amountByBrand[brand]={
                                                        current:0
                                                };

                                        }
                                        amountByBrand[brand].total = amountByBrand[brand].total+1;
                                        if (value.newestRecord['availability'].value === 0){
                                                amountByBrand[brand].current=amountByBrand[brand].current +1;
						amountByBrand['numberAvailable']['current']+=1;
					}
                                });
                                return amountByBrand;
                        }

		}
		this.layer = positionsLayer;
		return positionsLayer;
	}
};
var provinceBikeNetwork = {
	isCached:true,
	get : function(){
		if (this.isCached && this.layer !== undefined)
                        return this.layer;
		var map = new OpenLayers.StyleMap({
                        strokeColor: '#bb392b',
                        strokeWidth: 2,
			strokeDashstyle: 'longdash'
                });
		var positionsLayer = new OpenLayers.Layer.Vector("provinceBikeNetLayer", {
                        strategies: [new OpenLayers.Strategy.Cluster({distance:25,threshold: 2})],
			styleMap:map,
			preFeatureInsert: function(feature) {
                                feature.geometry.transform(new OpenLayers.Projection("EPSG:25832"),defaultProjection);
                        },
                });
		$.ajax({
                        url : 'export2.geojson',
                        dataType : 'json',
                        success : function(data) {
                                var features = new OpenLayers.Format.GeoJSON().read(data);
                                positionsLayer.removeAllFeatures();
                                positionsLayer.addFeatures(features);
                        },
                        error : function() {
                                console.log('problems with data transfer');
                        }
                });
		this.layer = positionsLayer;
		return positionsLayer;

	},
}

var osmBikeNetwork = {
	isCached:true,
	get : function(){
		if (this.isCached && this.layer !== undefined)
                        return this.layer;
		var map = new OpenLayers.StyleMap({
                        strokeColor: '#000',
                        strokeWidth: 2,
			strokeDashstyle: 'longdash'
                });
		var positionsLayer = new OpenLayers.Layer.Vector("osmBikeNetLayer", {
                        strategies: [new OpenLayers.Strategy.Cluster({distance:25,threshold: 2})],
			styleMap:map,
			preFeatureInsert: function(feature) {
                                feature.geometry.transform(new OpenLayers.Projection("EPSG:4326"),defaultProjection);
                        },
                });
		$.ajax({
                        url : 'export.min.geojson',
                        dataType : 'json',
                        success : function(data) {
                                var features = new OpenLayers.Format.GeoJSON().read(data);
                                positionsLayer.removeAllFeatures();
                                positionsLayer.addFeatures(features);
                        },
                        error : function() {
                                console.log('problems with data transfer');
                        }
                });
		this.layer = positionsLayer;
		return positionsLayer;

	},
}
var bzNetwork = {
	isCached:true,
	get : function(){
		if (this.isCached && this.layer !== undefined)
                        return this.layer;
		var map = new OpenLayers.StyleMap({
                        strokeColor: '#bb392b',
                        strokeWidth: 2,
			strokeDashstyle: 'longdash'
                });
		var positionsLayer = new OpenLayers.Layer.Vector("bzNetLayer", {
        		strategies: [new OpenLayers.Strategy.Cluster({distance:25,threshold: 2})],
			styleMap:map,
			preFeatureInsert: function(feature) {
                		feature.geometry.transform(new OpenLayers.Projection("EPSG:25832"),defaultProjection);
                	},
        	 });
        	 var  params = {
         		request:'GetFeature',
        	        outputFormat:'text/javascript',
			typeName:'p_bz-transport_network:BicycleLanes',
                	format_options: 'callback: callme'
	         };
        	 $.ajax({
         		url : "http://geoservices.retecivica.bz.it/geoserver/wfs?"+$.param(params),
	                dataType : 'jsonp',
        	        crossDomain: true,
                	jsonpCallback : 'callme',
	                success : function(data) {
				var features = new OpenLayers.Format.GeoJSON().read(data);
                	        btNetwork.layer.removeAllFeatures();
                        	bzNetwork.layer.addFeatures(features);
	                },
        	        error : function(error,code,wtf) {
				console.log(error);
				console.log(wtf);
                                console.log('problems with data transfer');
			}
		});
		this.layer = positionsLayer;
		return positionsLayer;
	}
}

var carSharingLayer = {
	isCached:true,
	getCarBrands : function(callback){
		integreen.getStationDetails('carsharingFrontEnd/rest/cars/',{},displayBrands);
		function displayBrands(data){
			var brands = {
				nothingSelected : function(){
					var selected = true;
					for (i in brands){
						if (brands[i]==true)
						selected = false;
					}
					return selected;
				}
			};
			$.each(data,function(index,value){
				brands[value.brand] = true;
			});
			$('.cartypes').empty();
			$.each(brands,function(index,value){
				if (typeof value == 'function')
				return true;
				var brandClass= index.replace(/[^a-zA-Z0-9]/g,'_');
				$('.carsharing .cartypes').append('<li class="clearfix"><p>' + index + '</p><a href="javascript:void(0)" brand="'+index+'" class="statuswidget toggler">'
				+'<svg width="55" height="30">'
				+	'<g>'
				+       	'<rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#8aaa30" height="24"/>'
				+               '<circle cx="34" cy="17" r="9" fill="#8aaa30" />'
				+       '</g>'
				+       'Sorry, your browser does not support inline SVG.'
				+ '</svg>'
				+ '</a></li>');
			});
			var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
			$('.carsharing .deselect-all').text(statusText);
			$('.carsharing .toggler').click(function(e){
				var brand = $(this).attr('brand');
				brands[brand] = !brands[brand];
				$(this).toggleClass('disabled');
				var statusText = brands.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
				$('.carsharing .deselect-all').text(statusText);
				carSharingLayer.retrieveStations(brands);
			});
			$('.carsharing .deselect-all').click(function(){
				var nothingSelected = brands.nothingSelected();
				if (!nothingSelected)
				$('.carsharing .toggler').addClass('disabled');
				else
				$('.carsharing .toggler').removeClass('disabled');
				$.each(brands,function(index,value){
					if (typeof(value)!='function')
					brands[index] = nothingSelected;
				});
				var statusText = !nothingSelected ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
				$('.carsharing .deselect-all').text(statusText);
				carSharingLayer.retrieveStations(brands);
			});
			if (callback != undefined)
			callback(brands);
		}
	},
	populate: function(){
		var self = this;
		if (self.brands == undefined)
		self.getCarBrands(self.retrieveStations);
	},
	retrieveStations : function(brands){
		var brandreq='';
		$.each(brands,function(index,value){
			if (value){
				if (brandreq != '')
				brandreq += "\\,";
				brandreq += '\''+index+'\'';
			}
		});
		var  params = {
			request:'GetFeature',
			typeName:'edi:Carsharing',
			outputFormat:'text/javascript',
			format_options: 'callback: carJson'
		};
		if (brandreq != '')
		params['viewparams']='brand:'+brandreq;
		$.ajax({
			url : SASABus.config.geoserverEndPoint+'wfs?'+$.param(params),
			dataType : 'jsonp',
			crossDomain: true,
			jsonpCallback : 'carJson',
			success : function(data) {
				var features = new OpenLayers.Format.GeoJSON().read(data);
				carSharingLayer.layer.removeAllFeatures();
				carSharingLayer.layer.addFeatures(features);
			},
			error : function() {
				console.log('problems with data transfer');
			}
		});


	},
	get:function(){
		if (this.isCached && this.layer != undefined)
		return this.layer;
		var styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({
			externalGraphic: '${externalGraphic}',
			graphicWidth: 35,
			graphicYOffset:-35.75,
		},{
			context: {
				externalGraphic:function(feature){
					var pin= 'images/6_Car_sharing/marker.svg';
					if (!feature.cluster){
						var max = feature.attributes.parking;
						var now = feature.attributes.value;
						var a = now/max;
						if (a == 0.)
						pin= 'images/6_Car_sharing/marker_red.svg';
						else if (a>0 && a <= 0.6)
						pin= 'images/6_Car_sharing/marker_orange.svg';
						else if (a>=0.6)
						pin= 'images/6_Car_sharing/marker_green.svg';
					}
					return pin;
				}
			}
		}));

		var positionsLayer = new OpenLayers.Layer.Vector("carStationsLayer", {
			strategies: [new OpenLayers.Strategy.Cluster({distance:25,threshold: 2})],
			styleMap: styleMap,
		});
		positionsLayer.events.on({
			"featureselected":function(e){
				if (!e.feature.cluster){
					var station = e.feature.attributes.stationcode;
					integreen.retrieveData(station,"carsharingFrontEnd/rest/",getCarsharingStation);
				}else{
          var vectors = new OpenLayers.Layer.Vector("vector", {isBaseLayer: false});
          vectors.addFeatures(e.feature.cluster);
          var dataExtent = vectors.getDataExtent();
          SASABus.map.setCenter(e.feature.geometry.bounds.centerLonLat);
          SASABus.map.zoomToExtent(dataExtent);
        }
			}
		});
		function getCarsharingStation(details,current){
			var updatedOn = moment(current['number-available'].timestamp).locale(lang).format('lll');
			$('.carsharingstation>.walk-container>.number-available').removeClass("free");
			if  (current['number-available'].value == details.availableVehicles)
			$('.carsharingstation>.walk-container>.number-available').addClass("free");

			radialProgress($(".carsharingstation .number-available")[0])
			.diameter(180)
			.value(current['number-available'].value)
			.maxValue(details.availableVehicles)
			.render();
			integreen.getChildStationsData(details.id,"carsharingFrontEnd/rest/cars/",displayCarsharingData);
			function getAmountByBrand(children){
				var amountByBrand = {};
				$.each(children,function(index,value){
					var brand = value.detail.brand;
					if (amountByBrand[brand] == undefined){
						amountByBrand[brand]={
							total: 0,
							current:0
						}
					}
					amountByBrand[brand].total = amountByBrand[brand].total+1;
					if (value.newestRecord['availability'].value == 0)
					amountByBrand[brand].current=amountByBrand[brand].current +1;
				});
				return amountByBrand;
			}
			function displayCarsharingData(children){
				var numbersByBrand = getAmountByBrand(children);
				$('.carsharingstation .car-categorys').empty();
				$('.carsharingstation .legend').empty();
				$('.modal').hide();
				$('.carsharingstation').show();
				for (brand in numbersByBrand){
					var brandClass= brand.replace(/[^a-zA-Z0-9]/g,'_');
					$('.carsharingstation .legend').append("<li class='car-categorys number-available clearfix'><div class='"+brandClass+"'></div><span>"+brand+"</span></li>");
					$('.car-categorys .'+brandClass).removeClass("free");
					if (numbersByBrand[brand].current === numbersByBrand[brand].total)
					$('.car-categorys .' + brandClass).addClass("free");
					radialProgress($('.car-categorys.number-available .'+brandClass)[0])
					.diameter(76)
					.value(numbersByBrand[brand].current)
					.maxValue(numbersByBrand[brand].total)
					.render();
				}
				$('.carsharingstation .title').html(details.name+"<br/><small>"+updatedOn+"</small>");
				$('.carsharingstation .caption').text(jsT[lang]['freeCars']);
			}
		};
		this.layer = positionsLayer;
		return this.layer;
	}
}

var carpoolingLayer = {
  isCached : true,
  retrieveStations : function(hubs,usertype){
    var hubreq='';
    $.each(hubs,function(index,value){
      if (value.active){
        if (hubreq != '')
        hubreq += "\\,";
        hubreq += '\''+index+'\'';
      }
    });
    var  params = {
      request:'GetFeature',
      typeName:'edi:Carpooling',
      outputFormat:'text/javascript',
      format_options: 'callback: jsonCarpooling'
    };
    if (hubreq!='')
    params['viewparams']='hubs:'+hubreq+';';
    if (usertype!='')
    params['viewparams']+='usertypes:'+usertype;
    $.ajax({
      url : SASABus.config.geoserverEndPoint+'wfs?'+$.param(params),
      dataType : 'jsonp',
      crossDomain: true,
      jsonpCallback : 'jsonCarpooling',
      success : function(data) {
        var features = new OpenLayers.Format.GeoJSON().read(data);
        carpoolingLayer.layer.removeAllFeatures();
        carpoolingLayer.layer.addFeatures(features);
      },
      error : function() {
        console.log('problems with data transfer');
      }
    });
  },
  get: function(){
    if (this.isCached && this.layer != undefined)
    return this.layer;
    var styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({
      externalGraphic: '${externalGraphic}',
      graphicWidth: 35,
      graphicYOffset:-35.75,
    },{
      context: {
        externalGraphic:function(feature){
          var pin= 'images/9_Carpooling/hub_marker.svg';
          if (!feature.cluster){
            if (feature.attributes.stationtype == 'CarpoolingHub')
              pin= 'images/9_Carpooling/hub_marker.svg';
            else{
              switch(feature.attributes.type){
                case 'A': pin='images/9_Carpooling/driver_marker.svg';break;
                case 'P': pin='images/9_Carpooling/passenger_marker.svg';break;
                case 'E': pin='images/9_Carpooling/dandp_marker.svg';break;
              }
            }
          }/*else{
            var vectors = new OpenLayers.Layer.Vector("vector", {isBaseLayer: false});
            vectors.addFeatures(feature.cluster);
            var dataExtent = vectors.getDataExtent();
            SASABus.map.setCenter(feature.geometry.bounds.centerLonLat);
            //SASABus.map.zoomToExtent(dataExtent);
          }*/
          return pin;
        }
      }
    }));
    var positionsLayer = new OpenLayers.Layer.Vector("carpoolingLayer", {
      styleMap: styleMap,
      //strategies: [new OpenLayers.Strategy.Cluster({distance: 25,threshold: 2})],
    });
    positionsLayer.events.on({
      "featureselected":function(e){
        if (!e.feature.cluster){
	  redrawAllBlueFeatures(e.feature);
          var station = e.feature.attributes.stationcode;
          if (e.feature.attributes.stationtype=='CarpoolingHub')
          integreen.retrieveData(station,"carpooling/rest/",displayHubsData);
          if (e.feature.attributes.stationtype=='CarpoolingUser'){
            resetAllIcons(e.feature);
            integreen.retrieveData(station,"carpooling/rest/user/",displayUserData);
          }
        }else{
          displayClusterFeatures(e.feature.cluster);
          var vectors = new OpenLayers.Layer.Vector("vector", {isBaseLayer: false});
          vectors.addFeatures(e.feature.cluster);
          var dataExtent = vectors.getDataExtent();
          SASABus.map.setCenter(e.feature.geometry.bounds.centerLonLat);
          SASABus.map.zoomToExtent(dataExtent);
        }
      }
    });
    this.layer = positionsLayer;
    return this.layer;
    function redrawAllBlueFeatures(feature){	
	var features = feature.layer.features;
	$.each(features,function(index,value){	
          var pin = 'images/9_Carpooling/hub_marker.svg';
          if (!value.cluster){
            if (value.attributes.stationtype == 'CarpoolingHub')
              pin= 'images/9_Carpooling/hub_marker.svg';
            else{
              switch(value.attributes.type){
                case 'A': pin='images/9_Carpooling/driver_marker.svg';break;
                case 'P': pin='images/9_Carpooling/passenger_marker.svg';break;
                case 'E': pin='images/9_Carpooling/dandp_marker.svg';break;
              }
            }
            value.style={
            	externalGraphic:pin,
                graphicWidth: 35,
                graphicYOffset:-35.75
            };
            positionsLayer.drawFeature(value);
          }
	});
    }
    function resetAllIcons(feature){
	var features = feature.layer.features;
	$.each(features,function(index,value){
		if (value.id != feature.id && value.data.stationcode != feature.data.parent){
			var pin ="";
            		if (value.attributes.stationtype == 'CarpoolingHub')
		          pin= 'images/9_Carpooling/hub_off_marker.svg';
		        else{
			  switch(value.attributes.type){
                            case 'A': pin='images/9_Carpooling/driver_off_marker.svg';break;
                            case 'P': pin='images/9_Carpooling/passenger_off_marker.svg';break;
                            case 'E': pin='images/9_Carpooling/dandp_off_marker.svg';break;
			  }
			}
			value.style={
				externalGraphic:pin,
				graphicWidth: 35,
			        graphicYOffset:-35.75
			};
			positionsLayer.drawFeature(value);
		}
	});
    }

    function displayClusterFeatures(features){
      $('.modal').hide();
      $('.station .title').html("Choose one");
      var html ="<ul>"
      html+= '</ul>';
      $('.station .content').html(html);
      features.forEach(function(feature,index){
        var featureHtml;
        featureHtml ='<li style="text-align:center;padding:10px;background-color:#3192c5;margin-bottom:10px">';
        if (feature.attributes.stationtype=='CarpoolingHub')
        featureHtml+='<a href="javascript:void(0)" class="clusterhub'+feature.attributes.stationcode+'">HUB '+feature.attributes.name+'</a>'
        if (feature.attributes.stationtype=='CarpoolingUser')
        featureHtml+='<a href="javascript:void(0)" class="clusteruser'+feature.attributes.stationcode+'">USER '+feature.attributes.name+'</a>'
        featureHtml+='</li>';
        $('.station .content ul').append(featureHtml);
        $('.station .content ul .clusterhub'+feature.attributes.stationcode).click(function(){
          integreen.retrieveData(feature.attributes.stationcode,"carpooling/rest/",displayHubsData);
        });
        $('.station .content ul .clusteruser'+feature.attributes.stationcode).click(function(){
          resetAllIcons(feature);
          integreen.retrieveData(feature.attributes.stationcode,"carpooling/rest/user/",displayUserData);
        });
      });
      $('.station').show();
    }
    function displayHubsData(details,state){
      $('.station .title').html(details.name);
      $('.modal').hide();
      var html = "";
      html += '<div class="carpooling-info"><div><img style="width:50px;height:50px" src="images/9_Carpooling/location.svg"/><p>'+(details.address)+'<br/>'+details.city+'</p></div><hr/>';
      integreen.getStationDetails('carpooling/rest/user/',{},function(userDetails){
	var driverCount = 0, passengerCount = 0;
	for (i in userDetails){
          var value = userDetails[i];
          if (value.parentStation == details.id){
            if (value.type=='A' || value.type=='E')
              driverCount++;
            if (value.type=='P' || value.type=='E')
              passengerCount++;
          }
        }
        html += '<div><img style="width:40px;height:40px" src="images/9_Carpooling/driver.svg"/><p>'+jsT[lang].driverRequests+" "+driverCount+'</p></div>';
        html += '<div><img style="width:40px;height:40px" src="images/9_Carpooling/passenger.svg"/><p>'+jsT[lang].passengerRequests+" "+passengerCount+'</p></div>';
        html += '</div><hr/>'
        html +='<div><a href="javascript:void(0)" class="backtomap ibutton" ><div>'+jsT[lang].backtomap+'</div></a></div>';
        $('.station .content').html(html);
        $('.station .backtomap.ibutton').click(function(){
          $('.modal').hide();
        });
        $('.station').show();
      });
    }
    function displayUserData(details,state){
      var htmlTitle = '<div> <img src="images/9_Carpooling/';
      var personType,personImg;
      if (details.type=='A'||details.type=='E'){
      	personImg = 'driver.svg';
        personType = jsT[lang].driver;
      }
      if (details.type=='P'||details.type=='E'){
        personImg = 'passenger.svg';
        personType==undefined||personType.length==0 ? personType = jsT[lang].passenger : personType += ' / '+jsT[lang].passenger;
      }
      htmlTitle += personImg;
      htmlTitle += '"/><p><strong>'+details.name+'</strong><br/>'+personType+'<br/>';
      var numberOfStars = 0;
      for (numberOfStars; numberOfStars < 5; numberOfStars++){	
        htmlTitle += numberOfStars < Math.round(details.userRating) ? '<img style="width:25px;height:25px" src="images/9_Carpooling/star.svg"/>' : '<img style="width:25px;height:25px" src="images/9_Carpooling/nostar.svg"/>';
      }
      htmlTitle += '</p>';	     
      htmlTitle += '</div>';	     
      $('.station .title').html(htmlTitle);
      $('.modal').hide();
      var html = "";
      html += '<div class="carpooling-info">';
      html += '<div><img src="images/9_Carpooling/location.svg"/><p><strong>'+jsT[lang].startAddressLabel+"</strong><br/>"+details.tripFrom.address+" ("+ details.tripFrom.city+')</p></div>';
      html += '<div><img src="images/Flag.svg"/><p><strong>'+jsT[lang].destinationHubLabel+'</strong><br/>'+details.tripToName+'</p></div>';
      if (details.pendular)	
      	html += '<div><img src="images/9_Carpooling/pendular.svg"/><strong>'+jsT[lang].pendularLabel+'</strong></div>';
      else
      	html += '<div><img src="images/9_Carpooling/pendular.svg"/><strong>'+jsT[lang].nonPendularLabel+'</strong></div>';
      html += '<div><img src="images/9_Carpooling/times.svg"/><div class="subflex"><strong>'+jsT[lang].arrivalTimeLabel+'</strong><strong>'+jsT[lang].departureTimeLabel+'</strong></div><div class="subflex"><div>'+details.arrival+'</div><div>'+details.departure+'</div></div></div>';
      if (details.additionalProperties && !jQuery.isEmptyObject(details.additionalProperties)){
        html += '<div><img src="images/9_Carpooling/notes.svg"/><strong>Notes</strong><br/>';
        for (i in details.additionalProperties)
          html += "<p>"+i+": "+details.additionalProperties[i]+"</p>";
        html += '</div>';
      }    
      html +='</div>';
      html +='<div><a target="_blank" href="https://hub.flootta.com/mobilitymeran/en/board.aspx?id_u='+details.id.replace('carpooling:','')+'" class="ibutton" ><div>Contact person</div></a></div>';
      html +='<div><a href="javascript:void(0)" class="backtomap ibutton" ><div>'+jsT[lang].backtomap+'</div></a><hr/></div>';
      $('.station .content').html(html);
      $('.station .backtomap.ibutton').click(function(){
        $('.modal').hide();
      });
      $('.station').show();
    }
  },
  populate: function(){
    var self = this;
    if (self.hubs == undefined)
    self.getTypes(self.retrieveStations);
  },
  getTypes : function(callback){
    integreen.getStationDetails('carpooling/rest/',{},displayBrands);
    function displayBrands(data){
      var usertype =  "'E'\\,'A'\\,'P'";
      var hubs = {
        nothingSelected : function(){
          var selected = true;
          for (i in hubs){
            if (hubs[i].active === true)
            selected = false;
          }
          return selected;
        }
      };
      $.each(data,function(index,value){
        hubs[value.id] = {
          active:true,
          name:value.name
        };
      });
      $('.carpoolingtypes').empty();
      var hubArray = [];
      for (key in hubs){
	  if (hubs[key].name != 'nothingSelected'){	
	      hubs[key].id=key;
              hubArray.push(hubs[key]);
          }
      }
      hubArray.sort(function(a,b){return a.name > b.name ? 1:-1});
      $.each(hubArray,function(index,value){
        if (typeof value == 'function')
            return true;
        var brandClass= value.id.replace(/[^a-zA-Z0-9]/g,'_');
        $('.carpooling .carpoolingtypes').append('<li class="clearfix carpoolinghub"><p>'+value.name+'</p><a brand='+value.id+' href="javascript:void(0)" class="toggler">'
        +'<svg width="55" height="30">'
        +       '<g>'
        +               '<rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#3192c5" height="24"/>'
        +               '<circle cx="34" cy="17" r="9" fill="#3192c5" />'
        +       '</g>'
        +       'Sorry, your browser does not support inline SVG.'
        + '</svg>'
        + '</a></li>'
      );
    });
    $('.carpooling .carpoolingtypes').append('<hr/>');
    $('.carpooling .carpoolingtypes').append('<li class="clearfix driver"><p>Autista</p><a href="javascript:void(0)" class="toggler">'
    +'<svg width="55" height="30">'
    +       '<g>'
    +               '<rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#3192c5" height="24"/>'
    +               '<circle cx="34" cy="17" r="9" fill="#3192c5" />'
    +       '</g>'
    +       'Sorry, your browser does not support inline SVG.'
    + '</svg>'
    + '</a></li>'
  ).append('<li class="clearfix passenger"><p>Passeggero</p><a href="javascript:void(0)" class="toggler">'
  +'<svg width="55" height="30">'
  +       '<g>'
  +               '<rect x="5" y="5" rx="12" ry="12" width="42" style="stroke:#3192c5" height="24"/>'
  +               '<circle cx="34" cy="17" r="9" fill="#3192c5" />'
  +       '</g>'
  +       'Sorry, your browser does not support inline SVG.'
  + '</svg>'
  + '</a></li>'
);
var statusText = hubs.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
$('.carpooling .main-config').append('<a href="javascript:void(0)" class="deselect-all" >'+statusText+'</a>');
$('.carpooling .main-config').append('<hr/>');
integreen.retrieveData("innovie","carpooling/rest/",displayAllData);
function displayAllData(stationData,currentState){
  $('.carpooling .main-config').append(stationData.name);
  $('.carpooling .main-config').append("<ul>");
  $.each(currentState,function(index,newestData){
    $('.carpooling .main-config').append("<li>"+index+' '+newestData.value+"</li>");
  });
  $('.carpooling .main-config').append("</ul>");
}
$('.carpoolinghub a').click(function(e){
  var brand = $(this).attr("brand");
  hubs[brand].active = !hubs[brand].active;
  $(this).toggleClass("disabled");
  var statusText = hubs.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
  $('.carpooling .deselect-all').text(statusText);
  carpoolingLayer.retrieveStations(hubs,usertype);
});
$('.driver a, .passenger a').click(function(e){
  $(this).toggleClass("disabled");
  var driverStatus = !$('.driver a').hasClass("disabled");
  var passengerStatus = !$('.passenger a').hasClass("disabled");
  if (driverStatus==true && passengerStatus==true) usertype = "'E'\\,'A'\\,'P'";
  else if (driverStatus == true) usertype = "'A'\\,'E'";
  else if (passengerStatus == true) usertype ="'P'\\,'E'";
  else usertype ='';
  carpoolingLayer.retrieveStations(hubs,usertype);
});
$('.carpooling .deselect-all').click(function(){
  var nothingSelected = hubs.nothingSelected();
  if (!nothingSelected){
    $('.carpooling .toggler').addClass('disabled');
    usertype = '';
  }
  else{
    $('.carpooling .toggler').removeClass('disabled');
    usertype = "'E'\\,'A'\\,'P'";
  }

  $.each(hubs,function(index,value){
    if (typeof value != 'function')
    hubs[index].active = nothingSelected;
  });
  var statusText = hubs.nothingSelected() ? jsT[lang]['selectAll'] : jsT[lang]['deselectAll'] ;
  $('.carpooling .deselect-all').text(statusText);
  carpoolingLayer.retrieveStations(hubs,usertype);
});
if (callback != undefined)
callback(hubs,usertype);
}
}
}

var codificaLinee = new Array();
var i = 0;
/*
Leggenda campi:
li_loc: contesto di localizzazione - 0 Urbano e 1 Extraurbano (solo nostro)
li_nr: numero della linea
str_li_var: variante
lidname: nome della linea
li_ri_nr: direzione della linea - 1 andata e 2 ritorno
li_r,li_g,li_b: colore RGB
*/

device = detectDevice();

codificaLinee['1'] = 0;
codificaLinee['2'] = 0;
codificaLinee['3'] = 0;
codificaLinee['4'] = 0;
codificaLinee['6'] = 0;
codificaLinee['146'] = 0;

codificaLinee['211'] = 1;
codificaLinee['201'] = 1;
codificaLinee['212'] = 1;
codificaLinee['213'] = 1;
codificaLinee['214'] = 1;
codificaLinee['225'] = 1;

if(device[0] == 'smartphone'){
	SASABus.config.rowsLimit = 2;
	SASABus.config.pinToDialogDistance 	= 48;
	SASABus.config.pinHeight			= 40;
	SASABus.config.yOffset				= 60;
	$('.map-body').append('<div id="serverTime"><span class="label">Time</span><span class="reload"></span></div>');
}
if(device[0] == 'desktop'){
	SASABus.config.yOffset				= 20;
	$('#map').append('<div id="serverTime"><span class="label">Time</span> <span class="reload"></span></div>');
}

/**
 Copyright (c) 2014 BrightPoint Consulting, Inc.

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
 */

function radialProgress(parent) {
    var _data=null,
        _duration= 1000,
        _selection,
        _margin = {top:0, right:0, bottom:30, left:0},
        __width = 300,
        __height = 300,
        _diameter,
        _label="",
        _fontSize=10;


    var _mouseClick;

    var _value= 0,
        _minValue = 0,
        _maxValue = 100;

    var  _currentArc= 0, _currentArc2= 0, _currentValue=0;

    var _arc = d3.svg.arc()
        .startAngle(0 * (Math.PI/180)); //just radians

    var _arc2 = d3.svg.arc()
        .startAngle(0 * (Math.PI/180))
        .endAngle(0); //just radians


    _selection=d3.select(parent);


    function component() {

        _selection.each(function (data) {

            // Select the svg element, if it exists.
            var svg = d3.select(this).selectAll("svg").data([data]);

            var enter = svg.enter().append("svg").attr("class","radial-svg").append("g");

            measure();

            svg.attr("width", __width)
                .attr("height", __height);


            var background = enter.append("g").attr("class","component")
                .attr("cursor","pointer")
                .on("click",onMouseClick);


            _arc.endAngle(360 * (Math.PI/180))

            background.append("rect")
                .attr("class","background")
                .attr("width", _width)
                .attr("height", _height);

            background.append("path")
                .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
                .attr("d", _arc);

            background.append("text")
                .attr("class", "label")
                .attr("transform", "translate(" + _width/2 + "," + (_width + _fontSize) + ")")
                .text(_label);
           var g = svg.select("g")
                .attr("transform", "translate(" + _margin.left + "," + _margin.top + ")");


            _arc.endAngle(_currentArc);
            enter.append("g").attr("class", "arcs");
            var path = svg.select(".arcs").selectAll(".arc").data(data);
            path.enter().append("path")
                .attr("class","arc")
                .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
                .attr("d", _arc);

            //Another path in case we exceed 100%
            var path2 = svg.select(".arcs").selectAll(".arc2").data(data);
            path2.enter().append("path")
                .attr("class","arc2")
                .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
                .attr("d", _arc2);


            enter.append("g").attr("class", "labels");
            var label = svg.select(".labels").selectAll(".label").data(data);
            label.enter().append("text")
                .attr("class","label")
                .attr("y",_width/2+_fontSize/3)
                .attr("x",_width/2)
                .attr("cursor","pointer")
                .attr("width",_width)
                // .attr("x",(3*_fontSize/2))
                .text(function (d) { return Math.round((_value-_minValue)/(_maxValue-_minValue)*100) + "%" })
                .style("font-size",_fontSize+"px")
                .on("click",onMouseClick);

            path.exit().transition().duration(500).attr("x",1000).remove();


            layout(svg);

            function layout(svg) {

                var ratio=(_value-_minValue)/(_maxValue-_minValue);
                var endAngle=Math.min(360*ratio,360);
                endAngle=endAngle * Math.PI/180;

                path.datum(endAngle);
                path.transition().duration(_duration)
                    .attrTween("d", arcTween);

                if (ratio > 1) {
                    path2.datum(Math.min(360*(ratio-1),360) * Math.PI/180);
                    path2.transition().delay(_duration).duration(_duration)
                        .attrTween("d", arcTween2);
                }

                label.datum(Math.round(ratio*100));
                label.transition().duration(_duration)
                    .tween("text",labelTween);

            }

        });

        function onMouseClick(d) {
            if (typeof _mouseClick == "function") {
                _mouseClick.call();
            }
        }
    }

    function labelTween(a) {
        var i = d3.interpolate(_currentValue, a);
        _currentValue = i(0);

        return function(t) {
            _currentValue = i(t);
            this.textContent = _value;
        }
    }

    function arcTween(a) {
        var i = d3.interpolate(_currentArc, a);

        return function(t) {
            _currentArc=i(t);
            return _arc.endAngle(i(t))();
        };
    }

    function arcTween2(a) {
        var i = d3.interpolate(_currentArc2, a);

        return function(t) {
            return _arc2.endAngle(i(t))();
        };
    }


    function measure() {
        _width=_diameter - _margin.right - _margin.left - _margin.top - _margin.bottom;
        _height=_width;
        _fontSize=_width*.2;
        _arc.outerRadius(_width/2);
        _arc.innerRadius(_width/2 * .85);
        _arc2.outerRadius(_width/2 * .85);
        _arc2.innerRadius(_width/2 * .85 - (_width/2 * .15));
    }


    component.render = function() {
        measure();
        component();
        return component;
    }

    component.value = function (_) {
        if (!arguments.length) return _value;
        _value = [_];
        _selection.datum([_value]);
        return component;
    }


    component.margin = function(_) {
        if (!arguments.length) return _margin;
        _margin = _;
        return component;
    };

    component.diameter = function(_) {
        if (!arguments.length) return _diameter
        _diameter =  _;
        return component;
    };

    component.minValue = function(_) {
        if (!arguments.length) return _minValue;
        _minValue = _;
        return component;
    };

    component.maxValue = function(_) {
        if (!arguments.length) return _maxValue;
        _maxValue = _;
        return component;
    };

    component.label = function(_) {
        if (!arguments.length) return _label;
        _label = _;
        return component;
    };

    component._duration = function(_) {
        if (!arguments.length) return _duration;
        _duration = _;
        return component;
    };

    component.onClick = function (_) {
        if (!arguments.length) return _mouseClick;
        _mouseClick=_;
        return component;
    }

    return component;

}



/////////////////////////////////////////////
// for debugging

// central call to print out the function name, when a function gets called
function printFunctionCalled(functionCall) {
	// for debugging uncommend the console.log statement!
	//
	//console.log(functionCall);
}

// logs the styleName value of the given element
function println(elementID, styleName) {
	console.log(elementID + "." + styleName + ": " +
		window.getComputedStyle(
			document.getElementById(elementID)
		).getPropertyValue(styleName)
	);
}
//////////////////////////////////////////////


Array.prototype.contains = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
}

Array.prototype.containsSubStr = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i].indexOf(obj)>=0) {
			return true;
		}
	}
	return false;
}

function isSmartPhoneMode() {
	//println("header-mobile", "display");
	return window.getComputedStyle(document.getElementById("header-mobile")).getPropertyValue("display") !== "none";
}

var mapLinesInit;
var mapLines;
var initialTop;

$(document).ready(function() {
	printFunctionCalled("$(document).ready(function()");
//	console.log($(document).height());
//	console.log($(window).height());

	// ---- Link esterno ----------------------------------------------------------------------------------------------------------
	$("a[href*='http://']:not([href*='"+location.hostname+"']),[href*='https://']:not([href*='"+location.hostname+"'])").attr("target","_blank");


 	// ---- Translations --------------
	lang 					= "it";
	lang_no_results 			= "Nessun risultato...";
	lang_no_results_text 			= "Prova a fare una nuova ricerca oppure usa i filtri per linea";
	lang_near_stop 				= "Le fermate più vicine...";
	lang_menu_linee				= "Filtro linee";
	lang_menu_search			= "Ricerca";
	lang_menu_about				= "About";
	lang_menu_settings			= "Settings";
	lang_close				= "chiudi";
	lang_lingua				= "Lingua";

	if($('body').hasClass('en')){
		lang = "en";
		lang_no_results 		= "No results...";
		lang_no_results_text 		= "Try another search or use the line-filters";
		lang_near_stop 			= "The closest stops...";
		lang_menu_linee			= "Lines";
		lang_menu_search		= "Search";
		lang_menu_about			= "EN About";
		lang_menu_settings		= "Settings";
		lang_close			= "close";
		lang_lingua			= "Language";
	}
	if($('body').hasClass('de')){
		lang = "de";
		lang_no_results 		= "Kein Ergebnis...";
		lang_no_results_text 		= "Versuchen Sie es mit einer neuen Suche oder benutzen Sie die Linienfilter";
		lang_near_stop 			= "Die nächsten Haltestellen...";
		lang_menu_linee			= "Linienfilter";
		lang_menu_search		= "Suche";
		lang_menu_about			= "DE About";
		lang_menu_settings		= "Einstellungen";
		lang_close			= "Schließen";
		lang_lingua			= "Sprache";
	}

	panelScrollElement = Array();
	moment.locale(lang);
	init(false);
	oneTime(device);

	//----------------------
	//on orientation change
	//----------------------
	function onOrientationChange(){
		printFunctionCalled("onOrientationChange()");
		setTimeout(function(){
			init(true);
		},20);
	}

	$('.config').click(function(element){
		var theme = $(this).attr('id');
		theme = theme.substring(0,theme.indexOf('-'));
		if (theme == 'walking')
			wegeStartPointsLayer.getRoutes();
		if(theme == 'parking')
			parkingLayer.getParkings();

		var isVisible= $('.' + theme+'.modal').is(':visible');
		$('.modal:visible').hide();
		if (!isVisible)
			$('.' + theme+'.modal').show();

	});
	$('.about-selector').click(function(){
		$('.about-box').toggle();
	});
	$('.close-modal,.backtomap').click(function(element){
		$('.modal').hide();
	});
	//android don't support orientationchange but resize
	var supportsOrientationChange = "onorientationchange" in window,
        orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

	$(window).bind(orientationEvent, function(){
		onOrientationChange();
	});

	// ---- Generic Stuff ----------------------------------------------------------------------------------------------------------
	function init(varOrientationChange){
		printFunctionCalled("init("+varOrientationChange+")");
	}

	function oneTime(device){
		printFunctionCalled("oneTime("+device+")");

		$('.map-controls').before('<div id="zoomButtons"><a href="#" id="zoomInButton"><img src="images/2_Map/Plus.svg" alt="Zoom in"/></a><a href="#" id="zoomOutButton"><img src="images/2_Map/Minus.svg" alt="Zoom out"/></a></div>');

		SASABus.init('map');
		linesLayer.getAllLines(initLinesAfterRead);
		var subDomain = document.domain.substring(0,document.domain.indexOf('.'));
		activateThemes(subDomain);
		$( ".menu>li a" ).click(function() {
			if ($(".modal:visible").length>0)
				$(".modal:visible").hide();
			else{
				$(this).toggleClass('active');
				activateThemes();
			}
		});
		function activateThemes(subdomain){
			if (subdomain == 'mobility')
				$(".menu>li a").addClass("active");
			if (subdomain != undefined && subdomain.length>0)
				$('.menu #'+subdomain).toggleClass('active');
			var themeArray = [];
			$( ".menu>li a.active").each(function(){
				themeArray.push($(this).attr('id'));
			});
			SASABus.activateSelectedThemes(themeArray);
		}
		$(".filters .toggler").click(function(){
			$(this).toggleClass("disabled");
			linesLayer.getLines(initLinesAfterRead);
		});
		function getReadableTime(){
			var a = new Date();

			//var date = a.getDate();
			var hour = a.getHours();
			if(hour < 10){
				hour = '0' + hour;
			}
			var minutes = a.getMinutes();
			if(minutes < 10){
				minutes = '0' + minutes;
			}
			//var sec = a.getSeconds();
			var time = hour + ':' + minutes ;

			$('#serverTime .reload').html(time);
		}

		setInterval(function() {
			getReadableTime();
		}, 10 * 1000);

		getReadableTime();

		$('a[rel=external]').attr('target','_blank');
	}

	if (isSmartPhoneMode()) {
		// on the smartphone the menu should be closed at first
		//$('div.panel').slideUp();

	}
});

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function initLinesAfterRead(lines)
{
	//alert(lines.toSource())

	// sort lines
	lines.sort(function(a,b){
		var el1 = pad((''+a['li_nr']).replace(' ','_'),5)+a['str_li_var'].replace(' ','_');
		var el2 = pad((''+b['li_nr']).replace(' ','_'),5)+b['str_li_var'].replace(' ','_');
		return el1-el2;
	});
	var htmlLineeU = new Array();
	var htmlLineeE = new Array();
	mapLinesInit = new Array();
	for(var i=0;i<lines.length;i++)
	{
		var linea = new Array();
		var k = 0;
		var codLinea = (''+lines[i]['li_nr']).replace(' ','_');
		var codVariante = lines[i]['str_li_var'].replace(' ','_');
		var nomeLinea = lines[i]['lidname'];
		var nomeVariante = lines[i]['str_li_var'];
		var color = 'rgb('+lines[i].li_r+','+lines[i].li_g+','+lines[i].li_b+') ';
		if(typeof htmlLineeU[codLinea] == 'undefined' && typeof htmlLineeE[codLinea] == 'undefined')
		{
			linea[k++] = '<li class="tick-list"></strong><p class="line l-'+codLinea+'"><span class="circle" style="background-color:'+color+'" /><strong class="line-no" id="l_'+codLinea+'">'+nomeLinea+'</strong><p/>';
			linea[k++] = '';
			linea[k++] = '</p>';
			linea[k++] = '<ul class="child-tick">';
			linea[k++] = '<li id="v_'+codLinea+'_'+codVariante+'">'+nomeVariante+'</li>';
			linea[k++] = '</ul>';
			linea[k++] = '</li>';
			if(codificaLinee[codLinea]==0)
				htmlLineeU[codLinea] = linea;
			else
				htmlLineeE[codLinea] = linea;
		}
		else
		{
			if(codificaLinee[codLinea]==0)
			{
				htmlLineeU[codLinea][1] = '<span class="var">'+txtVariante+'</span>'
				htmlLineeU[codLinea][4] += '<li id="v_'+codLinea+'_'+codVariante+'">'+nomeVariante+'</li>';
			}
			else
			{
				htmlLineeE[codLinea][1] = '<span class="var">'+txtVariante+'</span>'
				htmlLineeE[codLinea][4] += '<li id="v_'+codLinea+'_'+codVariante+'">'+nomeVariante+'</li>';
			}
		}
		mapLinesInit[i] = codLinea+':'+codVariante;
	}
	var htmlL = '';
	var urbanFilter = $("#urban").hasClass("disabled");
	var eurbanFilter = $("#eurban").hasClass("disabled");
	for(var i=0;i<htmlLineeU.length;i++)
	{
		if(typeof htmlLineeU[i] != 'undefined' && !urbanFilter)
		{

			if(htmlLineeU[i][1].length == 0)
				htmlL += htmlLineeU[i][0]+htmlLineeU[i][2]+htmlLineeU[i][6];
			else
				htmlL += htmlLineeU[i][0]+htmlLineeU[i][1]+htmlLineeU[i][2]+htmlLineeU[i][3]+htmlLineeU[i][4]+htmlLineeU[i][5]+htmlLineeU[i][6];
		}
	}
	//console.log('Urbane');
	//console.log(htmlL);
	for(var i=0;i<htmlLineeE.length;i++)
	{
		if(typeof htmlLineeE[i] != 'undefined' && !eurbanFilter)
		{
			if(htmlLineeE[i][1].length == 0)
				htmlL += htmlLineeE[i][0]+htmlLineeE[i][2]+htmlLineeE[i][6];
			else
				htmlL += htmlLineeE[i][0]+htmlLineeE[i][1]+htmlLineeE[i][2]+htmlLineeE[i][3]+htmlLineeE[i][4]+htmlLineeE[i][5]+htmlLineeE[i][6];
		}
	}
	//console.log('Extra');
	//console.log(htmlL);
	$('#urbani').html(htmlL);
	linesLayer.getLines(showLinesAfterRead(lines));
}

function stopPropagationCustom(){
	printFunctionCalled("stopPropagationCustom()");

	$('input, textarea, button, a, select, .line .icon, .line .var,.child-tick li, .tabs li').off('touchstart mousedown').on('touchstart mousedown', function(e) {
		e.stopPropagation();
	});
}

function showLinesAfterRead(lines){
	printFunctionCalled("showLinesAfterRead("+lines+")");

	// ---- Tabs ----------------------------------------------------------------------------------------------------------

	$('.child-tick').hide();
	$(".tab-content").hide();
	$('#variants .tabs li:first').addClass('active');
	$("#variants .tab-content:first").show();
	//$("#variants .tab-content .line").append('<span class="icon" />');

	$('.tabbed-content').each(function(){
		$(this).find('.tabs li').click(function(){
			tabbed_content = $(this).parents('.tabbed-content');
			tabbed_content.find('.active').removeClass('active');
			$(this).addClass('active');
			tabbed_content.find('.tab-content').hide();
			var activeTab = $(this).index();
			tabbed_content.find('.tab-content').eq(activeTab).fadeIn().addClass('active');
			panelScroll();
		});
	});

	// ---- Listing Variants ----------------------------------------------------------------------------------------------------------
	$('#variants ul.child-tick').hide();

	$('#deselectall').bind('touchstart click', function(){
		if($(this).hasClass('disabled')){
				$(this).text("Deselect all lines");
				$('#variants .line').addClass("enabled");
				linesLayer.showLines(['all']);
				for(var i=0;i<mapLinesInit.length;i++)
                                {
                                        mapLines.push(mapLinesInit[i]);
                                }
				$('#deselectall').removeClass('disabled');

			}else{
				$(this).text("Show all lines");
				$('#variants .tab-container .enabled').each(function(){
					var line = $(this).find('.line-no').attr('id').replace('l_','');
					var k = 0;
					if(mapLinesInit.containsSubStr(line+':'))
					{
						$(this).toggleClass('enabled');

						//Elimino le linee da mapLines
						for(var i=0;i<mapLines.length;i++)
						{
							if(mapLines[i].indexOf(line+':')==0)
							{
								mapLines.splice(i, 1);
								i--;
							}
							k++;
						}
						linesLayer.showLines(mapLines);
						panelScroll();
					}
				});
				$('#deselectall').addClass('disabled');
			}
	});

	$('#variants .tick-list').bind('touchstart click', function(){
		var line = $(this).find('.line-no').attr('id').replace('l_','');
		var k = 0;
		if(mapLinesInit.containsSubStr(line+':'))
		{
			$(this).find('.line').toggleClass('enabled');
			if($('.line.enabled').length){
				$('#deselectall').removeClass('disabled');
			}else{
				$('#deselectall').addClass('disabled');
			}
			//console.log($(this).parent('.line').attr('class'));
			var isEnable = $(this).find('.line').attr('class').indexOf('enabled')>=0;
			if(isEnable)
			{
				//console.log('ADD: '+mapLinesInit);
				//Aggiungo le linee da mapLines

				for(var i=0;i<mapLinesInit.length;i++)
				{
					if(mapLinesInit[i].indexOf(line+':')==0)
					{
						//console.log('Aggiungo: '+mapLinesInit[i]);
						mapLines.push(mapLinesInit[i]);
					}
					k++;
					//if(k>100) return;
				}
			}
			else
			{
				//console.log('DEL: '+mapLinesInit);
				//Elimino le linee da mapLines
				for(var i=0;i<mapLines.length;i++)
				{
					if(mapLines[i].indexOf(line+':')==0)
					{
						//console.log('trovato: elimino: '+mapLines[i]);
						mapLines.splice(i, 1);
						i--;
					}
					k++;
					//if(k>100) return;
				}
			}
			linesLayer.showLines(mapLines);
			panelScroll();
		}
	});

	$('#variants .var').click(function(){
		$('#variants .line').addClass('close');
		$(this).parent('.line').toggleClass('close');
		if($(this).parent('.line').next('.child-tick').is(':hidden')){
			$('#variants ul.child-tick').slideUp();
		} else {
			$('#variants .line').addClass('close');
		}
		$(this).parent('.line').next('.child-tick').slideToggle(100,function(){
			setTimeout(function(){
				panelScroll();
			},10);

		});
	});

	$('#variants .child-tick li').append('<span />');

	$('#variants .child-tick li').click(function(){
		var line = $(this).parent().parent().find('.line-no').attr('id').replace('l_','');
		var variante = $(this).attr('id').replace('v_'+line+'_','').trim();
		var k = 0;
		if(mapLinesInit.containsSubStr(line+':'+variante))
		{
			$(this).toggleClass('ticked');

			//console.log($(this).parent('.line').attr('class'));
			var isEnable = $(this).attr('class').indexOf('ticked')>=0;
			if(isEnable)
			{
				//console.log('ADD: '+mapLinesInit);
				//Aggiungo le linee da mapLines
				for(var i=0;i<mapLinesInit.length;i++)
				{
					if(mapLinesInit[i].indexOf(line+':'+variante)==0)
					{
						//console.log('Aggiungo: '+mapLinesInit[i]);
						mapLines.push(mapLinesInit[i]);
					}
					k++;
					if(k>100) return;
				}
			}
			else
			{
				//console.log('DEL: '+mapLinesInit);
				//Elimino le linee da mapLines
				for(var i=0;i<mapLines.length;i++)
				{
					if(mapLines[i].indexOf(line+':'+variante)==0)
					{
						//console.log('trovato: elimino: '+mapLines[i]);
						mapLines.splice(i, 1);
						i--;
					}
					k++;
					if(k>100) return;
				}
			}
			linesLayer.showLines(mapLines);
			panelScroll();
		}
	});


	// ---- PreFilled   ----------------------------------------------------------------------------------------------------------
	$.fn.preFilled = function() {
		$(this).focus(function(){
			if( this.value == this.defaultValue ) {
				this.value = "";
			}
		}).blur(function(){
			if( !this.value.length ) {
				this.value = this.defaultValue;
			}
		});
	};

	$('#search-field').preFilled();


	// ---- Map Panel   ----------------------------------------------------------------------------------------------------------

	//$('#main span.btn-toggle').click(function(){
	$('span.btn-toggle').click(function(){
		if($(this).hasClass('open')){
			$('div.panel').animate({'left' : '-375px'});
			$(this).removeClass('open').addClass('close').hide();
			var e = $(this);
			setTimeout(function(){
				e.animate({'right' : '-32px'});
				e.show();
			},400);
		}else{
			$(this).addClass('open').removeClass('close').css({'right':'0'});
			$('div.panel').animate({'left' : '0'});
		}
	});

	// in smartphone.css a menu button (mobile-menu-btn) will be displayed
	// in the header. the user can slideToggle the menu clicking it
	$('span.mobile-menu-btn').click(function(){
		$('div.panel').slideToggle();
		$(this).toggleClass('open');
		$('.modal').toggleClass("fullscreen");
	});

	$(window).resize(function(){
		panelScroll();
	});
	panelScroll();

	if(!$('body').hasClass('lte-8')){
		$('#scroll .iScrollIndicator').mousedown(function() {
			$(this).addClass('grabbing');
		});
		$('#scroll .iScrollIndicator').mouseup(function() {
			$(this).removeClass('grabbing');
		});
	};

	stopPropagationCustom();



	// ---- CSS PIE - Round Corners  ----------------------------------------------------------------------------------------------------------

	if($('body').hasClass('lte-8')){
		$('.list-actions .btn-add').addClass('corner-type-a');
		$('.corner-type-a').each(function(){
			$(this).append('<span class="corner-a corner-tl" /><span class="corner-a corner-tr" /><span class="corner-a corner-bl" /><span class="corner-a corner-br" />');
		});
	}

	if($('body').hasClass('lte-8')){
		if(window.PIE){
			$('.login-panel .submit input,.login-panel .field input,.panel-actions li.first,.panel-actions li.last,.panel-actions,.list-actions .search-form,.main-buttons a,.list-tab,.list-actions .order,.panel .btn-1,.panel .btn-2,.map-tools .btn-close').not('.panel .indicators .btn-2').each(function(){
				PIE.attach(this);
			});
		}
	}

	if($('body').hasClass('ie-8')){
		if(window.PIE){
			$('.box').each(function(){
				PIE.attach(this);
			});
		}
	}

	$('.tick-list').each(function(){
		var line = $(this).find('.line-no').html();
		$(this).parent('.line').toggleClass('enabled');
		//console.log(line);
	});

	//console.log(lines);
	mapLines = new Array();
	for(var i=0;i<lines.length;i++)
	{
		var codLinea = (''+lines[i]['li_nr']).replace(' ','_');
		var codVariante = lines[i]['str_li_var'].replace(' ','_');
		mapLines[i] = codLinea+':'+codVariante;
		$('#v_'+codLinea+'_'+codVariante).toggleClass('ticked');
	}

	//console.log(mapLines);

	$("#variants .tab-content .line").each(function(){
		var line = $(this).find('.line-no').attr('id').replace('l_','');
		if(mapLines.containsSubStr(line+':'))
			$(this).addClass('enabled close');
		else
			$(this).addClass('close');
	});
	//console.log('search-submit -> click');
	$("#search-form").submit(findResults);

}

// configures the internal scroll bars in .panel around #scroll
function panelScroll(){
	printFunctionCalled("panelScroll()");

	maxHeight = $('.panel-content-out').height();

	// there seams to be a problem on change of orientation,
	// the height of panel-content-out gets reported 0
	// we ignore these intermediate calls, because they create
	// the effect the menu gats shown without the content in the scroll
	if (maxHeight > 0) {
		$('.panel .scroll').css('max-height', maxHeight + 'px');

		if($('body').hasClass('lte-8')){
			$('#scroll').css('overflow-y','auto');
		}else{
			if($('#scroll').data('initialize') == '1'){
				panelScrollElement.refresh();
			}else{
				panelScrollElement 	= new IScroll('#scroll', { scrollbars: 'custom', mouseWheel: true, interactiveScrollbars: true});
				$('#scroll').data('initialize','1');
			}
			if($('.panel .scroll').height() < maxHeight){
				$('.iScrollVerticalScrollbar').addClass('hidden');
			}else{
				$('.iScrollVerticalScrollbar').removeClass('hidden');
			}
		}
	}
}

function findResults(){
	printFunctionCalled("findResults()");

	SASABus.removeAllLocations();
	var strFind = $("#search-field").val();
	if(strFind.length > 0){
		//console.log('length > 0');
		SASABus.geocode(strFind, successFind, failureFind);
		//console.log('after geocode');
	}
	return false;
}

function successFind(rows){
	printFunctionCalled("successFind(" + rows + ")");

	//console.log('success');
	//console.log(rows);
	//alert(rows.toSource())
	var strHtml = '';
	if(rows.length == 0){
		$('.search-box.result .title').html(lang_no_results);
		strHtml = '<li class="no-results">' + lang_no_results_text + '</li>';
	}else{
		$('.search-box.result .title').html(lang_near_stop);

		for(var i=0;i<rows.length;i++){
			fermate = rows[i]['stops'];
			for(var j=0;j<fermate.length;j++){
				//console.log(fermate[j]);
				SASABus.addLocation(rows[i]['lon'], rows[i]['lat']);
				strHtml += '<li class="result-item stop"><a href="#" rel="'+fermate[j]['ort_nr']+','+fermate[j]['onr_typ_nr']+'">'+fermate[j]['name']+'</a></li>';
			}
		}
	}
	$('.search-box.result .close').show();
	$("#listResults").html(strHtml);
	$("#listResults a").on('touchstart click',function(){
		showPoint($(this));
	});
	showResults();
	stopPropagationCustom();
	withoutHeaderHeight = $(window).outerHeight() - 130;

	scrollPanel = $('#search-container .scroll');
	scrollPanel.css('height',withoutHeaderHeight + 'px');
	elementNumber = scrollPanel.data('number');
	panelScrollElement[elementNumber].refresh();
}

function failureFind(){
	printFunctionCalled("failureFind()");

	$('.search-box.result .title').html(lang_no_results);
	$("#listResults").html('<li class="no-results">' + lang_no_results_text + '</li>');
	showResults();
}

function showPoint(element){
	printFunctionCalled("showPoint("+element+")");

	var arrCoord = element.attr('rel').split(',');
	//SASABus.showLocation(arrCoord[0],arrCoord[1]);
	SASABus.zoomToStop(arrCoord[0], arrCoord[1]);
//	if($('body').hasClass('smartphone')){
//		closePanel($('#search-container'));
//		closeMainMenuMobile();
//	}
}

function showResults(){
	$('div.search-box.result').show(0,function(){
		var resultHeight = $('div.search-box.result').outerHeight();
		var newTop = initialTop + resultHeight;
		$('.panel-content-out').css('top','auto');
	});
}

var myparkings;
var config = {
  types: [["occupied","","","300"]]
};
var parkingLayer = {
  isCached: true,
  retrieveParkingLots : function(){
    var  params = {
      request:'GetFeature',
      typeName:'edi:parking',
      outputFormat:'text/javascript',
      format_options: 'callback: parkingJson'
    };
    $.ajax({
      url : SASABus.config.geoserverEndPoint+'wfs?'+$.param(params),
      dataType : 'jsonp',
      crossDomain: true,
      jsonpCallback : 'parkingJson',
      success : function(data) {
        var features = new OpenLayers.Format.GeoJSON().read(data);
        parkingLayer.layer.removeAllFeatures();
        parkingLayer.layer.addFeatures(features);
      },
      error : function() {
        console.log('problems with data transfer');
      }
    });

  },
  populate: function(){
    var self = this;
    self.retrieveParkingLots();
  },
  get:function(){
    if (this.isCached && this.layer != undefined)
    return this.layer;
    var styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({
      externalGraphic: '${externalGraphic}',
      graphicWidth: 35,
      graphicYOffset:-35.75,
    },
    {
      context: {
        externalGraphic:function(feature){
          var pin= 'images/7_Parking/Pin.svg';
          if(!feature.cluster){
            var occupacy = feature.attributes.occupacypercentage;
            if(occupacy >= 90){
              pin = 'images/7_Parking/Pin_red.svg';
            }else if(occupacy >= 75){
              pin = 'images/7_Parking/Pin_orange.svg';
            }else{
              pin = 'images/7_Parking/Pin_green.svg';
            }
          }
          return pin;
        }
      }
    }));
    var positionsLayer = new OpenLayers.Layer.Vector("parkingLayer", {
      styleMap: styleMap,
      strategies: [new OpenLayers.Strategy.Cluster({distance: 25,threshold: 2})],
    });
    positionsLayer.events.on({
      "featureselected":function(e){
        if (!e.feature.cluster){
          var station = e.feature.attributes.stationcode;
          integreen.retrieveData(station,"parkingFrontEnd/rest/",parkingLayer.displayData, config);

        }else{
          var vectors = new OpenLayers.Layer.Vector("vector", {isBaseLayer: false});
          vectors.addFeatures(e.feature.cluster);
          var dataExtent = vectors.getDataExtent();
          SASABus.map.setCenter(e.feature.geometry.bounds.centerLonLat);
          SASABus.map.zoomToExtent(dataExtent);
        }
      }
    });
    this.layer = positionsLayer;
    return this.layer;

  },
  displayData: function(details, state){
    var html = ''
    $('.modal').hide();
    var updatedOn = moment(state['occupied'].timestamp).locale(lang).format('lll');
    $('.parkinglot-detail .title').html(details.name +"<br/><small>"+updatedOn+"</small>");
    html+='<div class="number-available"></div>';
    html+='<div class="caption">' + jsT[lang].availableParkingSpaces+'</div><hr/>';
    html+='<div class="metadata clearfix">';
    html+='<div class="address">'+details.mainaddress+'</div>';
    html+='<div class="capacity">'+ jsT[lang].capacity +': ' +details.capacity+'</div>';
    html+='<div class="phone">'+jsT[lang].phone + ' ' + details.phonenumber+'</div>';
    if(details.disabledtoiletavailable)
      html+='<div class="disabledtoilet">'+ jsT[lang].disabledtoilet +'</div>';
    if(details.disabledcapacity)
      html+='<div class="disabledcapacity">'+ jsT[lang].disabledcapacity + ': ' + details.disabledcapacity+'</div>';
    if(details.owneroperator)
      html+='<div class="operator">'+ jsT[lang].operator + ': ' +details.owneroperator+'</div>';
    html+='</div>';
    html+='<hr/><a href="javascript:void(0)" class="backtomap ibutton"><div>'+jsT[lang].backtomap+'</div></a><hr/>';
    $('.parkinglot-detail .content').html(html);
    $('.parkinglot-detail').show();
    $('.parkinglot-detail .backtomap.ibutton').click(function(){
      $('.modal').hide();
    });
    if (state['occupied'].value > details.capacity * 0.75){
      $('.parkinglot-detail .number-available').removeClass("free");
    }
    else{
      $('.parkinglot-detail .number-available').addClass("free");
    }
    radialProgress($('.parkinglot-detail .number-available')[0])
    .diameter(180)
    .value(details.capacity-state['occupied'].value)
    .maxValue(details.capacity)
    .render();
  },
  getParkings : function(){
    function displayParkingList(){
      var list = '';
      var newList = '';
      $.each(myparkings,function(index,value){
        list+='<li><a href="#" title="" id="'+value.id+'" class="list-parkings" data-lon="'+ value.longitude +'" data-lat="'+ value.latitude +'">';
        list+='<h4>'+value.name+'</h4>';
        list+='<div class="metadata clearfix">';
        list+='<div class="address">'+value.mainaddress+'</div>';
        list+='</div>';
        list+='</a></li>';
      });
      $(".parking .parking-list").html(list);
      $(".parking-list li a").click(function(){
        integreen.retrieveData($(this).attr('id'), "parkingFrontEnd/rest/",parkingLayer.displayData, config);
        var lonLat = new OpenLayers.LonLat($(this).attr('data-lon'), $(this).attr('data-lat')).transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:3857'));
        SASABus.map.setCenter(lonLat);
        SASABus.map.zoomToExtent(lonLat);
      });
    }
    function loadParkings(url){
      $.ajax({
        type: 'GET',
        crossDomain: true,
        url: url,
        dataType: 'json',
        success: function(response, status, xhr) {
          myparkings = response;
          displayParkingList();
        },
        error: function(xhr, status, error) {
          console.log(error);
        }
      });
    }
    var url = "http://idm-dev-fe.eu-west-1.elasticbeanstalk.com/parking/rest/get-station-details";
    if (myparkings == undefined){
      $(".parking .main-config .toggler").click(function(evt){
        $(this).toggleClass("disabled");
        displayParkingList();
      });
      loadParkings(url);
    }else{
      displayParkingList();
    }
  },
}
