
private var player:GameObject;
private var grid:GameObject;
private var mainScript;
private var radiusToPlayer = 4; // de straal die het sonarObject tot de speler behoud.
private var previousAngle : float = 0;
private var radiusShown = 100;
private var planeObject:GameObject;

private var playerLogic;
private var playerList;

function Start() 
{
	planeObject = GameObject.Find("Plane");
	playerLogic = GameObject.Find("Spawn").GetComponent("SpawnPlayerLogic");
}	

function Update () {
	if(Network.isClient){
		if(mainScript == null && GameObject.FindGameObjectWithTag("Grid"))
		{
			mainScript = GameObject.FindGameObjectWithTag("Grid").GetComponent(main);
		}else if(mainScript){
			
			if(player == null)
			{
				player = GameObject.Find("Player(Clone)");
			}else{
			
				playerList = playerLogic.getPlayerList();
				
				for(players in playerList)
				{
					if(players.nPlayer == Network.player)
					{
						if(players.hasRelic)
						{
							planeObject.layer = 8;
						}else{
							planeObject.layer = 9;
						}
					}
				}
			
			
				var nearestTreasure = mainScript.keyLock;
			
				var zAxesDifference:float;
			    zAxesDifference = player.transform.position.z - nearestTreasure.transform.position.z;
				
				var xAxesDifference:float;
			    xAxesDifference = nearestTreasure.transform.position.x -  player.transform.position.x;
				
				var currentAngle = ((Mathf.Atan2(xAxesDifference,zAxesDifference) * 180 / Mathf.PI)%360) + 180;
			
				var angle = previousAngle - currentAngle;
			
				transform.position.z = player.transform.position.z;
				transform.position.x = player.transform.position.x;
				transform.position.y = player.transform.position.y;
				
				transform.RotateAround(player.transform.position, Vector3.up, angle);
				previousAngle = currentAngle;	
			}
		}
	}
}
