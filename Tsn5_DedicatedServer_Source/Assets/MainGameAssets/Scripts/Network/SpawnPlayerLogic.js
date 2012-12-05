DontDestroyOnLoad(this);

var PlayerPrefab : Transform;
var Grid : Transform;

private var networkGrid : Transform;

public var maxGroupSize : int;
public var amountOfGroups : int;

private var localPlayer : NetworkPlayer;
private var isInstantiated : boolean = false;
public var objectHint : GameObject;

private var playerList : Array = new Array();

private var MolePosition : Array = new Array();
//public var objectHint : GameObject;

public var mainScript;
private var hasBeenSpawned : boolean = false;
private var loadingLevel : boolean = false;
static var inLoadingScreen : boolean = false;
private var idHasBeenAllocatedForAll : boolean = false;

public var healthlIcon : Texture2D;
public var attackIcon : Texture2D;
public var skullIcon : Texture2D;
public var keyIcon : Texture2D;
public var healthBarTexture : Texture2D;
public var healthBarFillTexture : Texture2D;
public var bigHealthBarTexture : Texture2D;
public var bigHealthBarFillTexture : Texture2D;
public var loadingBackground : Texture2D;
public var filledHexTexture : Texture2D;
public var emptyHexTexture : Texture2D;
public var defaultTexture : Texture2D;
public var defaultTextureGray : Texture2D;
private var loadingBlockPart : int = 0;

private var playerCanSpawn : boolean = false;
private var playersAgree : int = 0;
private var playerArray : ArrayList = new ArrayList();
private var playerNameArray : ArrayList = new ArrayList();
private var waitTime : int = 0;
private var lastPlayerIsSpawned : boolean = false;

class PlayerNode
{
	var nPlayer : NetworkPlayer;
	var isMole : boolean;
	var hasRelic : boolean = false;
	var numRelic : int = 0;
	var playerID : int;
	var playerName : String = "";
	var isReady : boolean = false;
	var health : float = 1;
	var playerAtackTime : float = -30;
	var playerAtackModeTime : float = -30;
	//var playerTeam : int;
}

// Receive server initialization, record own identifier as seen by the server.
// This is later used to recognize if a network spawned player is the local player.
// Also record assigned view IDs so the server can synch the player correctly.
@RPC
function initPlayer(player : NetworkPlayer){
	//Debug.Log("received player init! : "+player);
	localPlayer = player;
}

// Create a networked player in the game. Instantiate a local copy of the player.
@RPC
function spawnPlayer(player : NetworkPlayer, isMole : boolean, name : String, lastPlayer : boolean)
{
	
	Debug.Log("Spawning player "+player);
	var playerInstance : PlayerNode = new PlayerNode();
	playerInstance.nPlayer = player;
	//playerInstance.playerID = GameObject.FindGameObjectsWithTag("Player").length;
	playerInstance.isMole = isMole;
	playerInstance.playerName = name;
	
	// Initialize local player
	if (player == localPlayer) 
	{
		//Debug.Log("Attempting to set team");
		
		mainScript = GameObject.FindWithTag("Grid").GetComponent(main);
		//Debug.Log("player pos: "+getPlayerPos()+", SpawnArray.length: "+mainScript.spawnArray.length);
		Network.Instantiate(PlayerPrefab, mainScript.spawnArray[getPlayerPos()], transform.rotation, 0);		
		Camera.main.transform.position = mainScript.spawnArray[getPlayerPos()];	
		//GameObject.Find("Main Camera").GetComponent(SpringFollowCamera).Apply(GameObject.Find("Player(Clone)").transform, mainScript.spawnArray[getPlayerPos()]);
		//GameObject.Find("Main Camera").GetComponent(SpringFollowCamera).ApplySnapping(mainScript.spawnArray[getPlayerPos()]);
	}	
	
	playerList.Add(playerInstance);
	
	if (lastPlayer){
		lastPlayerIsSpawned = true;
	}
	
	Debug.Log("player added to my list");
	networkView.RPC("newPlayerCanSpawn", RPCMode.Server);
}

@RPC
function newPlayerCanSpawn(){
	playersAgree++;
	Debug.Log("A new player in game.."+playersAgree);
	if(playersAgree == GameObject.FindObjectOfType(NetworkLevelLoad).maxGroupSize){
		playersAgree = 0;
		playerCanSpawn = true;
	}
}

@RPC
function setPlayerIDFromObject(id : int, sendedPlayer : NetworkPlayer){
	//Debug.Log("localPlayer: "+localPlayer+", sendedPlayer: "+sendedPlayer);
	//Debug.Log(playerList.length+" length");
	for (player in playerList){
		if (player.nPlayer == sendedPlayer){
			Debug.Log("player "+player.nPlayer+" id has been set to "+id);
			player.playerID = id;
		}
	}
}

/*function setPlayerNames(){
	// Set on the ThirdPersonNetworkInit
	Debug.Log("Try to name the players...");

	for(p in playerList){
		Debug.Log("Set the name of ("+p.playerID+") to "+p.playerName+". (a total of "+GameObject.FindGameObjectsWithTag("Player").Length+" playerobjects present)");
		//GameObject.FindGameObjectsWithTag("Player")[p.playerID];
		var playerGuiText = GameObject.FindGameObjectsWithTag("Player")[p.playerID].GetComponent(GUIText);
		playerGuiText.text = p.playerName;
		//tooltip.GetComponent(ObjectLabel).target = GameObject.FindGameObjectsWithTag("Player")[p.playerID].transform;
		//playerGuiText.pixelOffset = Vector3(0,4.5,0);
		//playerGuiText.transform.position = Vector3(0.5,0.5,0);
		//tooltip.GetComponent(GUIText).text = p.playerName;
	}
}*/

function colorMoles(){
	Debug.Log("Try to color moles...");
	
	for(p in playerList){
		var rootJointComponent1 = GameObject.FindGameObjectsWithTag("Player")[p.playerID].transform.Find("polySurface14");
		var rootJointComponent2 = GameObject.FindGameObjectsWithTag("Player")[p.playerID].transform.Find("polySurface19");
		var rootJointComponent3 = GameObject.FindGameObjectsWithTag("Player")[p.playerID].transform.Find("polySurface24");
		var rootJointComponent4 = GameObject.FindGameObjectsWithTag("Player")[p.playerID].transform.Find("pSolid1");
	
		if (rootJointComponent1 && rootJointComponent2 && rootJointComponent3 && rootJointComponent4){
			rootJointComponent1.renderer.material.color = Color(0.3,0.3,0.3);
			rootJointComponent2.renderer.material.color = Color(0.3,0.3,0.3);
			rootJointComponent3.renderer.material.color = Color(0.3,0.3,0.3);
			rootJointComponent4.renderer.material.color = Color(0.3,0.3,0.3);
		}
		
		if(getIsMole()){
			if(p.isMole == true){
				Debug.Log("color me yellow please..."+p.playerID);
				if (rootJointComponent1 && rootJointComponent2 && rootJointComponent3 && rootJointComponent4){
					rootJointComponent1.renderer.material.color = Color(0.95,0.57,0);
					rootJointComponent2.renderer.material.color = Color(0.95,0.57,0);
					rootJointComponent3.renderer.material.color = Color(0.95,0.57,0);
					rootJointComponent4.renderer.material.color = Color(0.95,0.57,0);
				}			
			}
		}
	}
}

// This runs if the scene is executed from the loader scene.
// Here we must check if we already have clients connect which must be reinitialized.
// This is the same procedure as in OnPlayerConnected except we process already
// connected players instead of new ones. The already connected players have also
// reloaded the level and thus have a clean slate.
function OnNetworkLoadedLevel()
{
	Debug.Log("Loading level!");
	loadingLevel = true;

	//mainScript = GameObject.FindWithTag("Grid");
	
	if (Network.isServer)
	{
		Debug.Log("make the grid!");
		
		networkGrid = Network.Instantiate(Grid, transform.position, transform.rotation, 0);

		//Add moles on a random position
		MolePosition.Add(Random.Range(1,6));
		//MolePosition.Add(1); //voor test
		MolePosition.Add(Random.Range(6,11));
		//Debug.Log("pos1: "+MolePosition[0]+", pos2: "+MolePosition[1]);
	}	
	/*if (Network.isServer && Network.connections.Length > 0) {
		for (var p : NetworkPlayer in Network.connections) {
			//Debug.Log("Resending player init to "+p);
			Debug.Log("players were connected already, inniting!");
			connectPlayer(p);
		}
	}*/
}

function OnPlayerConnected(player : NetworkPlayer) 
{
	//also pass if he is a mole, to prevent timingissues. Ugly fix.
	//connectPlayer(player);
}

@RPC
function connectMyPlayer(name : String, info : NetworkMessageInfo)
{
	if (Network.isServer)
	{
		//only happens at the server
		
		var infoObject : NetworkMessageInfo = info;
		playerArray.Add(infoObject);
		//playerArray[playerArray.Length] = infoObject;
		
		var nameObjet : String = name;
		playerNameArray.Add(nameObjet);
		//playerNameArray[playerNameArray.Length] = nameObjet;
		
		if(playerArray.Count == GameObject.FindObjectOfType(NetworkLevelLoad).maxGroupSize){
			playerCanSpawn = true;
		}
	}
}

//spawn new player if other player is spawned
function spanNewPlayer(name : String, info : NetworkMessageInfo){
	var lastPlayer = false;
	//Remove items from spawn array
	playerArray.Remove(info);
	playerNameArray.Remove(name);
	
	if (playerArray.Count == 0){
		lastPlayer = true;
	}
	
	var player = info.sender;

	Debug.Log("SPAWNING the player, since I am the server");
	var playerIsMole : boolean = false;
	
	for (molePos in MolePosition){
		if (playerList.length+1 == molePos){
			playerIsMole = true;
		}
	} 

	networkView.RPC("initPlayer", player, player);
	networkView.RPC("spawnPlayer", RPCMode.All, player, playerIsMole, name, lastPlayer);
}

function OnPlayerDisconnected(player : NetworkPlayer){
	loadingLevel = false;

	Debug.Log("Destroy a player!");
	// this time, send rpc to all, since if a new player connects it doesnt need to be updated
	networkView.RPC("cleanUpPlayer", RPCMode.AllBuffered, player);
	Network.RemoveRPCs(player);
	Network.DestroyPlayerObjects(player);
	
	var allMoles : boolean = true;
	for (player in playerList)
	{
	 	if (!player.isMole)
	  	allMoles = false;
	}
	
	if (allMoles){
	 	//de mollen hebben gewonnen
	 	Debug.Log("Moles win!");
	 	for (player in playerList){
	  		//Network.RemoveRPCs(player, 0);
	  		Network.DestroyPlayerObjects(player.nPlayer);
	 	}
	}
}

@RPC
function cleanUpPlayer(player : NetworkPlayer)
{
	// Destroy the player object this network player spawned
	var deletePlayer : PlayerNode;
	
	for (var playerInstance : PlayerNode in playerList) {
		if (player == playerInstance.nPlayer) 
		{
			Debug.Log("Deletematch! player request: "+player+", player found: "+playerInstance.nPlayer+", deleting.");
			deletePlayer = playerInstance;
			var id = playerInstance.playerID;	
		}
	}
	
	// If a player is deleted, adjust the index of the remeining players with an ID equal to or greater than the deleted player.
	// Th names will be shown correctly this way.
	for (var playerInstance : PlayerNode in playerList) {
		if(playerInstance.playerID >= id){
			playerInstance.playerID--;
		}
	}
	
	Debug.Log("Deleting player "+deletePlayer);
	playerList.Remove(deletePlayer);
}

function OnGUI(){
	if(!hasBeenSpawned && loadingLevel && !lastPlayerIsSpawned){
		inLoadingScreen = true;
		GUI.depth = 9999;
		GUI.skin.box.normal.background = loadingBackground;
		GUI.skin.box.alignment = TextAnchor.LowerCenter;
		GUI.Box(Rect(0, 0,Screen.width,Screen.height), "The LOADING might take a few minutes, please be patient.");
		GUI.skin.box.normal.background = defaultTexture;
		GUI.skin.box.fontSize = 30;
		GUI.skin.box.alignment = TextAnchor.MiddleCenter;
		GUI.Box(Rect(40, 380,558,88), "Loading..");
		GUI.skin.box.normal.background = defaultTextureGray;
		GUI.Box(Rect(40, 470, 558, 88), "");
		for(var i = 0; i < 12; i++){
			if(i < loadingBlockPart){
				GUI.skin.box.normal.background = filledHexTexture;
			}
			else
			{
				GUI.skin.box.normal.background = emptyHexTexture;
			}
			GUI.Box(Rect((80+(i*40)),500, 32,28),"");
		}
		GUI.skin.box.fontSize = 14;
		GUI.skin.box.normal.background = null;
	}
	else { 
		inLoadingScreen = false;
	}
	
	if(GameObject.FindGameObjectsWithTag("Player").Length == playerList.length){
		for(p in playerList){
			playerinstance = GameObject.FindGameObjectsWithTag("Player")[p.playerID];
			if(playerinstance && GameObject.FindGameObjectsWithTag("Player")[p.playerID].transform.Find("polySurface14").gameObject.layer != 9){
				screenPoint = Camera.mainCamera.WorldToScreenPoint(playerinstance.transform.position);
				
				//Create skul icon
				if(Time.timeSinceLevelLoad - p.playerAtackTime <= 30.0  ){
					GUI.Box(Rect(screenPoint.x-50, (Screen.height-screenPoint.y)-75, 30, 30),skullIcon);
				}else if(Time.timeSinceLevelLoad - p.playerAtackModeTime <= 30.0  ){
					GUI.Box(Rect(screenPoint.x-50, (Screen.height-screenPoint.y)-75, 30, 30),attackIcon);
				}else if(p.health < 100){
					GUI.Box(Rect(screenPoint.x-50, (Screen.height-screenPoint.y)-75, 30, 30),healthlIcon);
				}else{
				
				}
				
				//Create key icon
				if(p.hasRelic){
					GUI.Box(Rect(screenPoint.x+10, (Screen.height-screenPoint.y)-75, 35, 20),keyIcon);
				}
				//Create health bar
				GUI.BeginGroup (Rect(screenPoint.x-50, (Screen.height-screenPoint.y)-95, 98, 23));
					GUI.Box (Rect (0,0, 98, 23),healthBarTexture);
					// draw the filled-in part:
					GUI.BeginGroup (new Rect (0, 0, 98 * p.health, 23));
						GUI.Box(Rect(0,5, 98, 13),healthBarFillTexture);
					GUI.EndGroup ();
				GUI.EndGroup ();
				
				//Debug.Log("Player bar health of player "+p.playerID+" is "+p.health);
				
				GUI.skin.label.alignment = TextAnchor.MiddleCenter;
				if(p.playerName){
					GUI.Label(Rect(screenPoint.x-100, (Screen.height-screenPoint.y)-107, 200, 20), p.playerName);
				}else{
					GUI.Label(Rect(screenPoint.x-100, (Screen.height-screenPoint.y)-107, 200, 20), "Unknow player");
				}
				
				//Draw big life bar
				if (p.nPlayer == localPlayer){
					//Create health bar
					GUI.BeginGroup (Rect(20, Screen.height-80, 282, 60));
						GUI.Box (Rect (0,0, 282, 60),bigHealthBarTexture);
						// draw the filled-in part:
						GUI.BeginGroup (new Rect (58, 11, 180 * p.health, 38));
							GUI.Box(Rect(0,0,238,38),bigHealthBarFillTexture);
						GUI.EndGroup ();
					GUI.EndGroup ();
				}
			}
		}
	}
}

// Custom debugging tool, made to check the array logic
function Update()
{
	loadingBlockPart++;
	if(loadingBlockPart > 12){
		loadingBlockPart = 0;
	}
	
	if (playerList.length>0){
	for (p in playerList)
		{
			if(!(Time.timeSinceLevelLoad - p.playerAtackTime <= 30.0) && !(Time.timeSinceLevelLoad - p.playerAtackModeTime <= 30.0) &&   p.health < 100){
				waitTime++;
				if(waitTime > 50){
					GameObject.FindObjectOfType(PlayerCombat).addPlayerHealth(p.playerID);
					waitTime = 0;
				}
			}
		}
	}
	
	if(playerCanSpawn && playerNameArray.Count != 0){
		playerCanSpawn = false;
		spanNewPlayer(playerNameArray[0], playerArray[0]);
	}
	
	if (mainScript && Network.isClient){
		if(mainScript.spawnArray.length > 0 && hasBeenSpawned == false){
			//if I have not been spawned yet, and I have the grid information, spawn myself.
			//You need the grid information since you need the spawnArray data from the mainscript in the pawnPlayer function
			Debug.Log("NOW IS THE TIME! PLAYER, I CHOOSE YOU!");
			networkView.RPC("connectMyPlayer", RPCMode.AllBuffered, PlayerPrefs.GetString("name"));
			hasBeenSpawned = true;
			
			networkView.RPC("affirmConnection", RPCMode.Server); //HIER
		}
	}		
		
	/*if (Input.GetKeyDown("space"))
	{
		Debug.Log("player info: ");
		for (playerNode in playerList)
		{
			Debug.Log("- playerName: "+playerNode.playerName);
			Debug.Log("- nPlayer: "+playerNode.nPlayer);
			Debug.Log("- playerID: "+playerNode.playerID);
			Debug.Log("- hasRelic: "+playerNode.hasRelic);
			Debug.Log("- numRelic: "+playerNode.numRelic);
			Debug.Log("- isMole: "+playerNode.isMole);
			Debug.Log("- health: "+playerNode.health);
			Debug.Log("-----------------------------");
			//Debug.Log("- playerTeam: "+playerNode.playerTeam);
		}
	}*/
	if(Input.GetKey("e")){
	 	/*for (player in playerList){
	 		 if (player.nPlayer == localPlayer){
	 		 	//drop the relic
	 		 	Grid.GetComponent(main).dropOwnTreasure(GameObject.Find("Player(Clone)").transform.position, GameObject.Find("Player(Clone)").GetComponent(ThirdPersonController).myTile, getNumRelic());
	 		 }
	 	}*/
	 	if (getHasRelic()) //HIER GEBLEVEN
	 	{
			mainScript.GetComponent(main).dropOwnTreasure(GameObject.Find("Player(Clone)").transform.position, GameObject.Find("Player(Clone)").GetComponent(ThirdPersonController).myTile, getNumRelic());
			setHasRelic(false);
		
			Debug.Log("dropping key");
		}
	}
	/*if(Input.GetKeyDown("6")){
		for (p in playerList){
			if (p.nPlayer == localPlayer){
				if (p.isMole){
					Debug.Log("I was a mole, not any longer!");
					networkView.RPC("setIsMole", RPCMode.AllBuffered, false, localPlayer);
				} else {
					Debug.Log("I wasn a mole, becoming one now!");
					networkView.RPC("setIsMole", RPCMode.AllBuffered, true, localPlayer);
				}
			}
		}
	}*/
	
	if (GameObject.FindGameObjectsWithTag("Player").Length == GameObject.FindObjectOfType(NetworkLevelLoad).maxGroupSize && idHasBeenAllocatedForAll == false){
		Debug.Log("all players are present: "+GameObject.FindGameObjectsWithTag("Player").Length+", allocating IDs");
		for (i=0; i<GameObject.FindGameObjectsWithTag("Player").Length; i++){
			if (GameObject.FindGameObjectsWithTag("Player")[i] == GameObject.Find("Player(Clone)")){
				networkView.RPC("setPlayerIDFromObject", RPCMode.AllBuffered, i, localPlayer);
			}
		}
		idHasBeenAllocatedForAll = true;
	}
}

@RPC 
function affirmConnection(){
	Debug.Log("player connected");
}

function die(){
	if (getHasRelic()) //HIER GEBLEVEN
	 {
			mainScript.GetComponent(main).dropOwnTreasure(GameObject.Find("Player(Clone)").transform.position, GameObject.Find("Player(Clone)").GetComponent(ThirdPersonController).myTile, getNumRelic());
			setHasRelic(false);
	}
	Network.Disconnect();
}

function playerAttackedPlayer(sendedPlayer: NetworkPlayer){
	for (player in playerList){
		if (player.nPlayer == sendedPlayer){
			player.playerAtackTime = Time.timeSinceLevelLoad;
		}
	}
}

function playerAttackedByPlayerOrEmeny(sendedPlayer: NetworkPlayer){
	for (player in playerList){
		if (player.nPlayer == sendedPlayer){
			player.playerAtackModeTime = Time.timeSinceLevelLoad;
		}
	}
}

function playerAttackedByPlayerOrEmenyByID(id: int){
	for (player in playerList){
		if (player.playerID == id){
			player.playerAtackModeTime = Time.timeSinceLevelLoad;
		}
	}
}


function getPlayerPos()
{
	//Debug.Log("getting team");
	for (var i=1; i<amountOfGroups; i++){
		if (playerList.length < maxGroupSize*i){
			//Debug.Log("Unsaturated team found, "+amountOfGroups+" groups with "+maxGroupSize+" players each: assigned player to team "+i);
			return i;
		}
	}
}

// DIT HOORT
function setHasRelic(setValue : boolean){
	//for (player in playerList){
		//if (player.nPlayer == localPlayer){
			//player.hasRelic = setValue;
			networkView.RPC("updateHasRelicForEveryone", RPCMode.AllBuffered, setValue, localPlayer);
		//}
	//}
}

@RPC
function updateHasRelicForEveryone(setValue : boolean, sendedPlayer : NetworkPlayer, info : NetworkMessageInfo){
	//Debug.Log('Updating has relic');
	//Debug.Log("sender: "+info.sender);
	for (player in playerList){
		//if the sender is from someone else or if it is me
		if (player.nPlayer == sendedPlayer){
			//Debug.Log("Player "+player+" has recieved a relic (myself: "+localPlayer+"), (sender: "+info.sender+"), updated on this client!");
			player.hasRelic = setValue;
		}
	}
}
// BIJ ELKAAR

function getLocalPlayer(){
	return localPlayer;
}

function getHasRelic(){
	for (player in playerList){
		if (player.nPlayer == localPlayer){
			return player.hasRelic;
		}
	}
}

@RPC
function setIsMole(setValue : boolean, sendedPlayer: NetworkPlayer){
	for (player in playerList){
		if (player.nPlayer == sendedPlayer){
			player.isMole = setValue;
			MolePosition.Add(player.playerID);
		}
	}
	colorMoles();
}

function getIsMole(){
	for (player in playerList){
		if (player.nPlayer == localPlayer){
			return player.isMole;
		}
	}
}

function setNewHealth(h : int){
	var healthFloat : float = parseFloat(h) / 100;
	Debug.Log("My health = "+h+" - "+healthFloat);
	if (h>0){
		networkView.RPC("updatePlayerHealth", RPCMode.AllBuffered, healthFloat, localPlayer);
	}
}
	
@RPC
function updatePlayerHealth(h : float, sendedPlayer : NetworkPlayer, info : NetworkMessageInfo){
	for (p in playerList) {
		if (p.nPlayer == sendedPlayer) 
		{
			p.health = h;
			//Debug.Log("New health of player "+p.nPlayer+" health "+h);
		}
	}
}

// DIT HOORT
function setNumRelic(setValue : int){
	//for (player in playerList){
		//if (player.nPlayer == localPlayer){
			//player.numRelic = setValue;
			networkView.RPC("updateNumRelicForEveryone", RPCMode.AllBuffered, setValue, localPlayer);
		//}
	//}
}

@RPC
function updateNumRelicForEveryone(setValue : int, sendedPlayer : NetworkPlayer, info : NetworkMessageInfo){
	for (player in playerList){
		//if the sender is from someone else or if it is me
		if (player.nPlayer == sendedPlayer){
			//Debug.Log("Player "+player+" has recieved a relicnumber, updated on this client!");
			player.numRelic = setValue;
		}
	}
}
// BIJ ELKAAR

function getNumRelic(){
	for (player in playerList){
		if (player.nPlayer == localPlayer){
			return player.numRelic;
		}
	}
}

function getPlayerList(){
	return playerList;
}

/*function setPlayerID(){
	var playerObjects = GameObject.FindGameObjectsWithTag("Player");
	for (var i=0; i<playerObjects.Length; i++){
		if (playerObjects[i] == GameObject.Find("Player(Clone)")){
			var id = i;
			// You now know the position of yourself in the Unity array of player gameobjects. Send that position as ID
		}
	}
	networkView.RPC("updateIdForEveryone", RPCMode.AllBuffered, id, localPlayer);
}

@RPC
function updateIdForEveryone(id : int, sendedPlayer : NetworkPlayer){
	for (player in playerList){
		if (player.nPlayer == sendedPlayer){
			Debug.Log("The player ID of player "+sendedPlayer+" was set to "+id);
			player.playerID = id;
		}
	}
}*/