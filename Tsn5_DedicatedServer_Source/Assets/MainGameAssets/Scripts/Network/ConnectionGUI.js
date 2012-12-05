public var team = 1;

function OnConnectedToServer(){
	for(var go : GameObject in FindObjectsOfType(GameObject))
		go.SendMessage("OnNetworkLoadedLevel", SendMessageOptions.DontRequireReceiver);
}

function Update () {
}