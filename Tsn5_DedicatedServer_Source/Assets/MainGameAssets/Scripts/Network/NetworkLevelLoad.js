private var lastLevelPrefix = 0;
public var canConnect = true;
public var maxGroupSize = 3;
public var playerName : String;

private var dieValue: int;

function Awake(){
	DontDestroyOnLoad(this);
	networkView.group = 1;
	
	playerName = "Jantje";
	Network.isMessageQueueRunning = true;
	
	Application.LoadLevel("EmptyScene");
}


function OnGUI () {
	// When network is running (server or client) then display the level "StarTrooper"
	if (Network.peerType != NetworkPeerType.Disconnected)
	{
		var amountOfConnections = Network.connections.Length;
		//Debug.Log(amountOfConnections + "\n" + maxGroupSize);
		
		//if the lobby is full, you didnt start the game yet, only the server can send the rpc
		if (amountOfConnections == maxGroupSize && canConnect && Network.isServer)
		{	
			MasterServer.RegisterHost(GetComponent(MasterServerGui).gameName, "stuff", "closed");
		
			// Make sure no old RPC calls are buffered and then send load level command
			Network.RemoveRPCsInGroup(0);
			Network.RemoveRPCsInGroup(1);
			// Load level with incremented level prefix (for view IDs)
			networkView.RPC("LoadLevel", RPCMode.AllBuffered, "MainGame", lastLevelPrefix + 1);
			
			Debug.Log("closing server");

			canConnect = false;
		}
	}
}

@RPC
function LoadLevel(level : String, levelPrefix : int){
	//Debug.Log("Loading level "+level+" with prefix "+levelPrefix);
	lastLevelPrefix = levelPrefix;
	
	Network.SetSendingEnabled(0, false);
	Network.isMessageQueueRunning = false;
	Network.SetLevelPrefix(levelPrefix);
	Application.LoadLevel(level);
	yield;
	yield;
	
	Network.isMessageQueueRunning = true;
	Network.SetSendingEnabled(0, true);
	
	var go : Transform[] = FindObjectsOfType(Transform);
	var go_len = go.Length;
	
	for (var i=0; i<go_len;i++){
		go[i].SendMessage("OnNetworkLoadedLevel", SendMessageOptions.DontRequireReceiver);
	}
	
	GameObject.FindObjectOfType(MasterServerGui).setInLobby(false);
	
}

function OnDisconnectedFromServer(){
	canConnect = true;
	Application.LoadLevel("EmptyScene");
}

@script RequireComponent(NetworkView)

function Update () {
}

function getDieValue()
{
	return dieValue;
}

function setDieValue(dieVal:int)
{
	dieValue = dieVal;
}