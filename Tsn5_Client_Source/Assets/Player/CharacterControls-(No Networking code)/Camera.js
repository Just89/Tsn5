var target: GameObject;

var cameraPosX:int;
var cameraPosY:int;
var cameraPosZ:int;

var cameraRotX:int;
var cameraRotY:int;
var cameraRotZ:int;

function Update () {
	if (target == null) {
		target = GameObject.Find("Player(Clone)");
	}else{
		transform.position.y = target.transform.position.y + cameraPosY;
	    transform.position.x = target.transform.position.x + cameraPosX;
	    transform.position.z = target.transform.position.z - cameraPosZ;
    }
    
   	var rotation = Quaternion.Euler(cameraRotX,cameraRotY,cameraRotZ);
    transform.rotation = rotation; 
}