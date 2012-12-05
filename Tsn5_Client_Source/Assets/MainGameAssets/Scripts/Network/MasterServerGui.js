DontDestroyOnLoad(this);

var gameName = "TSN 5";
var serverPort = 25002;

var cursorImage : Texture;

private var timeoutHostList = 0.0;
private var lastHostListRequest = -1000.0;
private var hostListRefreshTimeout = 1.0;

private var connectionTestResult : ConnectionTesterStatus = ConnectionTesterStatus.Undetermined;
private var filterNATHosts = false;
private var probingPublicIP = false;
private var doneTesting = false;
private var timer : float = 0.0;
private var useNat = false;
private var errorShown = false;

private var windowRect;
private var serverListRect;
private var hideTest = false;
private var testMessage = "Undetermined NAT capabilities";

var buttonSkin : GUISkin;
private var cameraObject : Camera;
private var hideMainControls : boolean = true;
private var exitPressed : boolean = false;
private var settingsMenu : boolean = false;

// Enable this if not running a client on the server machine
MasterServer.dedicatedServer = true;

//Start screen
private var inLobby = false;
private var playersToStartGame : int;
public var filledHexTexture : Texture2D;
public var emptyHexTexture : Texture2D;
public var defaultTexture : Texture2D;
public var defaultTextureGray : Texture2D;
public var defaultTextureSelected : Texture2D;

private var connectionCount : int = 0;

private var controlsArray = new Array (KeyCode.W, KeyCode.S, KeyCode.A, KeyCode.D, KeyCode.Space);
private var controlsLabelArray = new Array ("Move up","Move down","Move left","Move right","Punch");
private var selectedControl = 0;
private var selectedControlSelected = false;
private var e : Event;
private var prevMenu : int = 0;
private var hidePlayerNameBox : boolean = true;
private var playerName : String = "";

//Setting variables

var masterVolume : float = 0.0;
var videoQuality : float = 0.0;

function Start() {
	playerName = PlayerPrefs.GetString("name");
	PlayerPrefs.SetString("name", "");
    PlayerPrefs.SetInt("playersEscaped", 0);
	PlayerPrefs.SetInt("strength", 100);
	PlayerPrefs.SetInt("playersLeft", 8);
    Screen.showCursor = false;
    playersToStartGame = gameObject.GetComponent("NetworkLevelLoad").maxGroupSize;
}

function OnFailedToConnectToMasterServer(info: NetworkConnectionError)
{
	Debug.Log(info);
}

function OnFailedToConnect(info: NetworkConnectionError)
{
	Debug.Log(info);
}

function setInLobby(boolVal : boolean){
	inLobby = boolVal;
}

function OnGUI()
{
	//windowRect = GUILayout.Window (0, windowRect, MakeWindow, "Server Controls");
	//if (Network.peerType == NetworkPeerType.Disconnected && MasterServer.PollHostList().Length != 0)
	//	serverListRect = GUILayout.Window(1, serverListRect, MakeClientWindow, "Server List");
	
	cameraObject = GameObject.Find("Main Camera").camera;
	cameraObject.clearFlags = CameraClearFlags.SolidColor;
	cameraObject.backgroundColor = Color(0.2, 0.2, 0.2, 1);
	if(hideMainControls){
		//if (!hideTest)
		//{
			if (Time.realtimeSinceStartup > lastHostListRequest + hostListRefreshTimeout)
			{
				MasterServer.RequestHostList(gameName);
				lastHostListRequest = Time.realtimeSinceStartup;
			}
			//hideTest = true;
		//}
		
		//if (Network.peerType == NetworkPeerType.Disconnected && MasterServer.PollHostList().Length != 0){
			//serverListRect = GUILayout.Window(1, serverListRect, MakeClientWindow, "Server List");
			GUI.skin = buttonSkin;
			if(GUI.Button(Rect(40,40,558,88), "Quick play")){
			
				MasterServer.RequestHostList(gameName);
				lastHostListRequest = Time.realtimeSinceStartup;
			
				if(!PlayerPrefs.GetString("name") || PlayerPrefs.GetString("name") == ""){
					hidePlayerNameBox = false;
				}else{
					hideMainControls = false;
					inLobby = true;
					ConnectAvaibleServer();
				}
			}
			if(GUI.Button(Rect(40, 130,558,88), "Settings")){
				hideMainControls = false;
				settingsMenu = true;
				prevMenu = 1;
			}
			if(GUI.Button(Rect(40, Screen.height-120,558,88), "Exit")){
				Application.Quit();
			}
		//}
	}
	if(inLobby && playersToStartGame > connectionCount){
		GUI.skin = buttonSkin;
		GUI.skin.box.normal.background = defaultTexture;
		if(GUI.Button(Rect(40, Screen.height-120,558,88), "Disconnect")){
			hideMainControls = true;
			inLobby = false;
			Network.Disconnect();
			MasterServer.UnregisterHost();
		}
		GUI.skin.box.fontSize = 30;
		GUI.Box(Rect(40, 40,558,88), "Waiting for players..");
		GUI.skin.box.normal.background = defaultTextureGray;
		GUI.Box(Rect(40, 130, 558, 88), "");
		//if(connectionCount){
			//Debug.Log("Players in game: "+connectionCount);
			for(var i = 0; i < playersToStartGame; i++){
				if(i < connectionCount){
					GUI.skin.box.normal.background = filledHexTexture;
				}else{
					GUI.skin.box.normal.background = emptyHexTexture;
				}
				
				GUI.Box(Rect((80+(i*40)),160, 32,28),"0");
				//Debug.Log("Draw box");
			}
		//}
	}
	if(exitPressed){
		if (Input.GetKeyDown(KeyCode.Escape)){
			
			exitPressed = false;
		}
		GUI.skin = buttonSkin;
		GUI.skin.box.normal.background = defaultTexture;
		if(GUI.Button(Rect(40,40,558,88), "Resume")){
			exitPressed = false;
		}
		if(GUI.Button(Rect(40, 130,558,88), "Settings")){
			exitPressed = false;
			settingsMenu = true;
			prevMenu = 2;
		}
		if(GUI.Button(Rect(40, Screen.height-120,558,88), "Disconnect")){
			exitPressed = false;
			Network.Disconnect();
			MasterServer.UnregisterHost();
			hideMainControls = true;
		}
	}
	if(settingsMenu){
	
		/*if (Input.GetKeyDown("escape")){
			settingsMenu = false;
			exitPressed = true;
		}*/
		
		GUI.skin = buttonSkin;
	
		GUI.skin.box.normal.background = defaultTexture;
		GUI.skin.box.fontSize = 14;
		GUI.skin.box.alignment = UnityEngine.TextAnchor.MiddleLeft;
		GUI.Label(Rect(40, 40,300,40), "Sound");
		
		if(selectedControl == 5){
			if(selectedControlSelected)
				GUI.skin.box.normal.background = defaultTextureSelected;
			else
				GUI.skin.box.normal.background = defaultTextureGray;
		}else{
			GUI.skin.box.normal.background = defaultTexture;
		}
		GUI.Box(Rect(40, 80,558,44), "Master volume");
		
		masterVolume = GUI.HorizontalSlider(Rect(240,95,300,44), masterVolume, 0.0, 100.0);
		
		GUI.Label(Rect(40, 140,300,40), "Video");
		
		if(selectedControl == 6){
			if(selectedControlSelected)
				GUI.skin.box.normal.background = defaultTextureSelected;
			else
				GUI.skin.box.normal.background = defaultTextureGray;
		}else{
			GUI.skin.box.normal.background = defaultTexture;
		}
		GUI.Box(Rect(40, 180,558,44), "Quality");
		videoQuality = GUI.HorizontalSlider(Rect(240,195,300,44), videoQuality, 0.0, 100.0);
		
		
		GUI.Label(Rect(40, 240,300,40), "Controls");
		
		for(i = 0; i < controlsArray.length; i++){
			if(selectedControl == i){
				if(selectedControlSelected)
					GUI.skin.box.normal.background = defaultTextureSelected;
				else
					GUI.skin.box.normal.background = defaultTextureGray;
			}else{
				GUI.skin.box.normal.background = defaultTexture;
			}
			GUI.Box(Rect(40, 280+(i*40),558,44), controlsLabelArray[i]);
			if(selectedControlSelected && selectedControl == i){
				GUI.skin.label.normal.textColor = Color.white;
				GUI.Label(Rect(360, 290+(i*40),148,44), "<SELECT KEY>");
				 	e = Event.current;
				    if (e.isKey && e.keyCode != KeyCode.Return) {
				        controlsArray[i] = e.keyCode;
				        
				        selectedControlSelected = false;
				    }

			}else{
				GUI.skin.label.normal.textColor = Color.yellow;
				GUI.Label(Rect(360, 290+(i*40),148,44), controlsArray[i].ToString());
			}
		}
		
		GUI.skin.label.normal.textColor = Color.white;
		GUI.Label(Rect(70, 500,600,44), "Press 'RETURN' to select and 'BACKSPACE' to deselect.");
		
		if(GUI.Button(Rect(40, Screen.height-120,558,88), "Back")){
			settingsMenu = false;
			if(prevMenu == 1){
				hideMainControls = true;
			}else if(prevMenu == 2){
				exitPressed = true;
			}
		}
	}
	
	var mousePos : Vector3 = Input.mousePosition;
    var pos : Rect = Rect(mousePos.x,Screen.height - mousePos.y,cursorImage.width,cursorImage.height);
    
    if (!gameObject.GetComponent(SpawnPlayerLogic).inLoadingScreen){
    	GUI.Label(pos,cursorImage);
    }
    /*if (!gameObject.GetComponent(SpawnPlayerLogic).inLoadingScreen && gameObject.GetComponent(Chat).enabled == false)
    {
    	gameObject.GetComponent(Chat).enabled = true;
    }*/
	
	if(!hidePlayerNameBox){
		GUI.Window(0, Rect(150,350,250,100), EnterNameWindow, "Enter your name:");
	}
	
	if (errorShown){
		inLobby = false;
		hideMainControls = true;
		var windowRectt = GUILayout.Window(2, Rect(Screen.width/2-150,Screen.height/2-50,300,100), DoMyWindow, "No servers available");
	}
}

function ConnectAvaibleServer()
{
	Debug.Log("Try to connect a free server...");
	var data : HostData[] = MasterServer.PollHostList();
	var count = 0;
	Debug.Log("length: "+data.Length);
	
	/*if (data.Length == 0){
		// No servers available, show an error window
		Network.InitializeServer(32, serverPort, useNat);
		MasterServer.RegisterHost(gameName, "stuff", "open");
		//errorShown = true;
	}*/
	
	var thereWasNoOpenServer = false;
	for (var element in data)
	{
		if (element.comment == "open")
		{
			// There's an open server... join it!
			thereWasNoOpenServer = false;
			Network.Connect(element);
			return;
		}
		else 
		{
			// No servers are open, show an error window
			thereWasNoOpenServer = true;
		}
	}
	if (thereWasNoOpenServer){
		errorShown = true;
		thereWasNoOpenServer = false;
	}
}


function Awake ()
{
	windowRect = Rect(Screen.width-300,0,300,100);
	serverListRect = Rect(0, 0, Screen.width - windowRect.width, 100);
	
	// Start connection test
	connectionTestResult = Network.TestConnection();
	
	// What kind of IP does this machine have? TestConnection also indicates this in the
	// test results
	if (Network.HavePublicAddress())
		Debug.Log("This machine has a public IP address");
	else
		Debug.Log("This machine has a private IP address");
}

function Update()
{
	
	// If test is undetermined, keep running
	if (!doneTesting)
		TestConnection();
		
	if (Input.GetKeyDown("escape")){
		exitPressed = true;
	}
	
	if(settingsMenu){
		if(Input.GetKeyDown(KeyCode.Return)){
			selectedControlSelected = true;
		}
		if(Input.GetKeyDown(KeyCode.Backspace)){
			selectedControlSelected = false;
		}
		if(selectedControl == 6){
			if(selectedControlSelected){
				if ((Input.GetKeyDown(KeyCode.DownArrow) || Input.GetKeyDown(KeyCode.LeftArrow)) && videoQuality > 0){
					videoQuality--;
				}
				if ((Input.GetKeyDown(KeyCode.UpArrow) || Input.GetKeyDown(KeyCode.RightArrow)) && videoQuality < 100){
					videoQuality++;
				}
			}
		}
		if(selectedControl == 5){
			if(selectedControlSelected){
				if ((Input.GetKeyDown(KeyCode.DownArrow) || Input.GetKeyDown(KeyCode.LeftArrow)) && masterVolume > 0){
					masterVolume--;
				}
				if ((Input.GetKeyDown(KeyCode.UpArrow) || Input.GetKeyDown(KeyCode.RightArrow)) && masterVolume < 100){
					masterVolume++;
				}
			}
		}
		if(!selectedControlSelected){
			if (Input.GetKeyDown(KeyCode.DownArrow)){
				selectedControl++;
			}
			if (Input.GetKeyDown(KeyCode.UpArrow)){
				selectedControl--;
			}
			if(selectedControl < 0){
				selectedControl = 6;
			}
			if(selectedControl > 6){
				selectedControl = 0;
			}
		}
	}
}

function TestConnection()
{
	// Start/Poll the connection test, report the results in a label and react to the results accordingly
	connectionTestResult = Network.TestConnection();
	switch (connectionTestResult)
	{
		case ConnectionTesterStatus.Error: 
			testMessage = "Problem determining NAT capabilities";
			doneTesting = true;
			break;
			
		case ConnectionTesterStatus.Undetermined: 
			testMessage = "Undetermined NAT capabilities";
			doneTesting = false;
			break;
						
		case ConnectionTesterStatus.PublicIPIsConnectable:
			testMessage = "Directly connectable public IP address.";
			useNat = false;
			doneTesting = true;
			break;
			
		// This case is a bit special as we now need to check if we can 
		// circumvent the blocking by using NAT punchthrough
		case ConnectionTesterStatus.PublicIPPortBlocked:
			testMessage = "Non-connectble public IP address (port " + serverPort +" blocked), running a server is impossible.";
			useNat = false;
			// If no NAT punchthrough test has been performed on this public IP, force a test
			if (!probingPublicIP)
			{
				Debug.Log("Testing if firewall can be circumvented");
				connectionTestResult = Network.TestConnectionNAT();
				probingPublicIP = true;
				timer = Time.time + 10;
			}
			// NAT punchthrough test was performed but we still get blocked
			else if (Time.time > timer)
			{
				probingPublicIP = false; 		// reset
				useNat = true;
				doneTesting = true;
			}
			break;
		case ConnectionTesterStatus.PublicIPNoServerStarted:
			testMessage = "Public IP address but server not initialized, it must be started to check server accessibility. Restart connection test when ready.";
			break;
			
		case ConnectionTesterStatus.LimitedNATPunchthroughPortRestricted:
			Debug.Log("LimitedNATPunchthroughPortRestricted");
			testMessage = "Limited NAT punchthrough capabilities. Cannot connect to all types of NAT servers.";
			useNat = true;
			doneTesting = true;
			break;
					
		case ConnectionTesterStatus.LimitedNATPunchthroughSymmetric:
			Debug.Log("LimitedNATPunchthroughSymmetric");
			testMessage = "Limited NAT punchthrough capabilities. Cannot connect to all types of NAT servers. Running a server is ill adviced as not everyone can connect.";
			useNat = true;
			doneTesting = true;
			break;
		
		case ConnectionTesterStatus.NATpunchthroughAddressRestrictedCone:
		case ConnectionTesterStatus.NATpunchthroughFullCone:
			Debug.Log("NATpunchthroughAddressRestrictedCone || NATpunchthroughFullCone");
			testMessage = "NAT punchthrough capable. Can connect to all servers and receive connections from all clients. Enabling NAT punchthrough functionality.";
			useNat = true;
			doneTesting = true;
			break;

		default: 
			testMessage = "Error in test routine, got " + connectionTestResult;
	}
}

function EnterNameWindow(id : int){
	playerName = GUI.TextArea(Rect(30,30,200,20),playerName,25);
	GUI.skin.button.fontSize = 14;
	if (GUI.Button (Rect(30,55,200,35),"Save name") && playerName != "")
	{
		PlayerPrefs.SetString("name", playerName);
		hideMainControls = false;
		hidePlayerNameBox = true;
		inLobby = true;
		ConnectAvaibleServer();
	}
	GUI.skin.button.fontSize = 30;
}

function MakeWindow (id : int)
{	
	hideTest = GUILayout.Toggle(hideTest, "Hide test info");
	
	if (!hideTest)
	{
		GUILayout.Label(testMessage);
		if (GUILayout.Button ("Retest connection"))
		{
			Debug.Log("Redoing connection test");
			probingPublicIP = false;
			doneTesting = false;
			connectionTestResult = Network.TestConnection(true);
		}
	}
	
	if (Network.peerType == NetworkPeerType.Disconnected)
	{
		GUILayout.BeginHorizontal();
		GUILayout.Space(10);
		
		// Join an existing server. Else, show an error message
		if (GUILayout.Button ("Play the game"))
		{
			var data : HostData[] = MasterServer.PollHostList();
			var count = 0;
			
			if (data.Length == 0){
				// No servers available, show an error window
				Debug.Log("starting server");
				Network.InitializeServer(32, serverPort, useNat);
				MasterServer.RegisterHost(gameName, "stuff", "open");
				//errorShown = true;
			}
			
			for (var element in data)
			{
				if (element.comment == "open")
				{	
					if(!PlayerPrefs.GetString("name") || PlayerPrefs.GetString("name") == ""){
						hidePlayerNameBox = false;
					}else{
						Debug.Log("Connect");
						// There's an open server... join it!
						Network.Connect(element);
						hideMainControls = false;
						inLobby = true;
						return;
					}
				}
				else 
				{
					// No servers are open, show an error window
					errorShown = true;
				}
			}
		}

		// Refresh hosts
		if (GUILayout.Button ("Refresh available Servers") || Time.realtimeSinceStartup > lastHostListRequest + hostListRefreshTimeout)
		{
			MasterServer.RequestHostList(gameName);
			lastHostListRequest = Time.realtimeSinceStartup;
		}
		
		GUILayout.FlexibleSpace();
		
		GUILayout.EndHorizontal();
	}
	else
	{
		if (GUILayout.Button ("Disconnect"))
		{
			Network.Disconnect();
			MasterServer.UnregisterHost();
		}
		GUILayout.FlexibleSpace();
	}
	GUI.DragWindow (Rect (0,0,1000,1000));
}

function DoMyWindow(windowID : int){
	GUILayout.Label("There are no open servers. You could manually start one yourself by starting VS_server.exe");
	if (GUILayout.Button("Ok")){
		errorShown = false;
	}
}

function MakeClientWindow(id : int)
{
	GUILayout.Space(5);

	var data : HostData[] = MasterServer.PollHostList();
	var count = 0;
	for (var element in data)
	{
		GUILayout.BeginHorizontal();

		// Do not display NAT enabled games if we cannot do NAT punchthrough
		if ( !(filterNATHosts && element.useNat) )
		{
			var connections = element.connectedPlayers + "/" + element.playerLimit;
			GUILayout.Label(element.gameName);
			GUILayout.Space(5);
			GUILayout.Label(connections);
			GUILayout.Space(5);
			var hostInfo = "";

			// Indicate if NAT punchthrough will be performed, omit showing GUID
			if (element.useNat)
			{
				GUILayout.Label("NAT");
				GUILayout.Space(5);
			}
			// Here we display all IP addresses, there can be multiple in cases where
			// internal LAN connections are being attempted. In the GUI we could just display
			// the first one in order not confuse the end user, but internally Unity will
			// do a connection check on all IP addresses in the element.ip list, and connect to the
			// first valid one.
			for (var host in element.ip)
				hostInfo = hostInfo + host + ":" + element.port + " ";
			
			//GUILayout.Label("[" + element.ip + ":" + element.port + "]");	
			GUILayout.Label(hostInfo);	
			GUILayout.Space(5);
			GUILayout.Label(element.comment);
			GUILayout.Space(5);
			GUILayout.FlexibleSpace();
			//if (GUILayout.Button("Connect"))
				//Network.Connect(element);
		}
		GUILayout.EndHorizontal();	
	}
}

function OnPlayerConnected(player : NetworkPlayer){
	//Executes only on the server
	if (Network.connections.Length > GetComponent(NetworkLevelLoad).maxGroupSize){
		Debug.Log("Too many players! Kicking the last one");
		networkView.RPC("kickAfterJoin", player);
	} else {
		networkView.RPC("addPlayerToConnectionCount", RPCMode.AllBuffered);
	}
}

function OnPlayerDisconnected(player : NetworkPlayer){
	networkView.RPC("deletePlayerFromConnectionCount", RPCMode.AllBuffered);
}

@RPC
function addPlayerToConnectionCount(){
	// RPC from server when a player connects
	connectionCount++;
	Debug.Log("Added a player!! "+connectionCount);
}

@RPC
function deletePlayerFromConnectionCount(){
	connectionCount--;
	Debug.Log("Deleted a player!! "+connectionCount);
}

/*function OnPlayerConnected(player : NetworkPlayer){
	if (Network.connections.Length > GetComponent(NetworkLevelLoad).maxGroupSize){
		Debug.Log("Too many players! Kicking the last one");
		networkView.RPC("kickAfterJoin", player);
	}
}*/

@RPC
function kickAfterJoin(){
	Network.Disconnect();
}
