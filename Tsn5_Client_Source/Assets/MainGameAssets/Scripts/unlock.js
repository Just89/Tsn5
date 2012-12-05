private var playerLogic;
private var playerList;
private var playerObjects;
private var player;
private var playerID:int;

public var clickCounter:int = 0;
public var hasClicked:boolean;

public var playerToWin:int = 1;
private var winningPlayers:Array = new Array();
private var distance:float;

function Start()
{
	playerLogic = GameObject.Find("Spawn").GetComponent("SpawnPlayerLogic");
	player = GameObject.Find("Player(Clone)");
}

function OnMouseDown() 
{ 
	//Debug.Log("distance from lock: "+Vector3.Distance (player.transform.position, transform.position));
	if(Vector3.Distance (player.transform.position, transform.position) < 11)
	{
		//Debug.Log("i iz in range");
		playerList = playerLogic.getPlayerList();
		
		for(player in playerList)
		{
			if(player.nPlayer == Network.player)
			{
				//Debug.Log("player correct, u were clicking");
				if(hasClicked == false && player.hasRelic && player.isMole == false)
				{
					//Debug.Log("You have a relic, and clicked the exit!");
					networkView.RPC("startChecking", RPCMode.AllBuffered);
					hasClicked = true;
				}
			}
		}
	}	
}

@RPC
function startChecking(info : NetworkMessageInfo)
{
	if (Network.isServer)
	{
		playerList = playerLogic.getPlayerList();
		
		for(player in playerList)
		{	
			if(player.nPlayer == info.sender && player.hasRelic)
			{	
				
				clickCounter++;
				Debug.Log("clickCounter "+clickCounter);
				winningPlayers.Push(info.sender);
				if(clickCounter == playerToWin)
				{
					for(winners in winningPlayers)
					{
						networkView.RPC("removeWinningPlayers", winners);
						networkView.RPC("sendWinningAmount", RPCMode.AllBuffered);
					}

					winningPlayers.Clear();
				}
			}
		}
	}
}

@RPC
function removeWinningPlayers()
{	
	//PlayerPrefs.SetInt("playersLeft", PlayerPrefs.GetInt("playersLeft") - 1);
	Network.Disconnect();	
	Application.LoadLevel("EndScreen");
}

function Update () {
	if(!Network.isServer)
	{
		if(player == null)
		{
			player = GameObject.Find("Player(Clone)");
		}
		if(hasClicked)
		{	
			if(Vector3.Distance (player.transform.position, transform.position) > 11.0)
			{
				hasClicked = false;
				networkView.RPC("removeWinningPlayer", RPCMode.AllBuffered);
			}
		}
	}
}

@RPC
function removeWinningPlayer(info:NetworkMessageInfo)
{
	if(Network.isServer)
	{	
		clickCounter--;
		winningPlayers.Remove(info.sender);
		Debug.Log("clickCounter "+clickCounter);
	}
}

@RPC
function sendWinningAmount(){
	PlayerPrefs.SetInt("playersLeft", PlayerPrefs.GetInt("playersLeft") - 1);
	PlayerPrefs.SetInt("playersEscaped", PlayerPrefs.GetInt("playersEscaped") + 1);
	if(PlayerPrefs.GetInt("playersLeft") <= 3){
		if(player.isMole == true){
			GameObject.FindObjectOfType(NetworkLevelLoad).setDieValue(2);
			Application.LoadLevel("EndScreen");
		}
		else{
			GameObject.FindObjectOfType(NetworkLevelLoad).setDieValue(1);
			Application.LoadLevel("EndScreen");
		}
	}
	if(PlayerPrefs.GetInt("playersEscaped") == 8){
		GameObject.FindObjectOfType(NetworkLevelLoad).setDieValue(1);
		Application.LoadLevel("EndScreen");
	}
}