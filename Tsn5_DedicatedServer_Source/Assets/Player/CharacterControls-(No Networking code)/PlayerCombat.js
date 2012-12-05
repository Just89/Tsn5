// STANDALONE

@script ExecuteInEditMode()

var punchRadius : double = 3;
var punchPosition = new Vector3 (0.4, 0, 0.7);
var startHealth : int = 100;
var attackTime : double = 1.0;
var attackAngle = 30;
var startAttackDamage : float = 10.0;
var attackDamage : float = startAttackDamage;
var hasAttacked : boolean = false;
var passedAttackTime : double = 0;
var playerHealth : int = startHealth;
private var moleAttackDamage : float = startAttackDamage;
var timeToAdvance : int;
//var isDead : boolean;

private var canAdjust : boolean = true;
private var wasHitTimer : int = 100;

//playerObject = GameObject.FindGameObjectWithTag("Player");
//characterController = playerObject.GetComponent(CharacterController);
var enemys : GameObject[];
var target : Transform;
var textLbl: String = "hoi";

var respawnTime : double = 5;
var timeDead : double = 0;
var targetDir : Vector3;
var currentAngle : float;
var pvpTargetDir : Vector3;
var pvpCurrentAngle : float;

private var mainScript;

function Update(){
	//if(networkView.isMine){
	textLbl = "" + this.playerHealth;
	
	if(Input.GetButtonDown("Fire1")){
		SendMessage("DidPunch", SendMessageOptions.DontRequireReceiver);
		attack();
	}
	if(hasAttacked){
		if(passedAttackTime < attackTime)
			passedAttackTime += Time.deltaTime;
		else{
			hasAttacked = false;
		}
	}
	if (Network.isServer)
	{
		// change moleattackDamage based on time
		if (Mathf.FloorToInt(Time.timeSinceLevelLoad) % timeToAdvance == 0){
			if (canAdjust){    
				canAdjust = false;
				moleAttackDamage++;
				//tristan fix, hier stond newAttack
				networkView.RPC("setMoleAttack", RPCMode.AllBuffered, moleAttackDamage);
			}
		}
		else {
			canAdjust = true;
		}
	}
}
	
@RPC
function setMoleAttack(newAttack : float){
	var isMole = GameObject.Find("Spawn").GetComponent(SpawnPlayerLogic).getIsMole();
	if (isMole){
		attackDamage = newAttack;
	}
	var newPercentage : int = Mathf.FloorToInt((newAttack/startAttackDamage)*100);
	PlayerPrefs.SetInt("strength", Mathf.Abs((newAttack/startAttackDamage)*100));
	Debug.Log("MoleAttack Increased"+ newPercentage);
}

function attack()
{	
	if(!hasAttacked)
	{
		//do the attack
		passedAttackTime = 0;
		hasAttacked = true;
		//Debug.Log("aanvalluhhh");
		var player = GameObject.Find("Player(Clone)");
		var playerPos = Vector3(player.transform.position.x, player.transform.position.y, player.transform.position.z);
		enemys = GameObject.FindGameObjectsWithTag("Enemy");
		var enemyPlayers = GameObject.FindGameObjectsWithTag("Player");
		//Debug.Log("aantal players:"+enemyPlayers.Length);
		for(var i=0; i< enemys.Length; i++){
			var dist = Vector3.Distance(enemys[i].transform.position, playerPos);
			//Debug.Log(dist + "<=" + punchRadius);
			if(dist <= punchRadius){
				//Debug.Log("Binnen punchRadius");
				targetDir = enemys[i].transform.position - playerPos;	
				currentAngle = Vector3.Angle(targetDir, player.transform.forward);
				//Debug.Log(currentAngle + "<=" + attackAngle);
				if(currentAngle <= attackAngle){
					//Debug.Log("dealing damage");
					enemys[i].GetComponent(EnemyTreeController).takeDamage(attackDamage);
					GameObject.FindObjectOfType(PunchingSound).setPlaySound();
				}
			}			
		}
		for (var k = 0; k < enemyPlayers.Length; k++)
		{
			//networkView.RPC("playerCheck", RPCMode.AllBuffered, 1,networkView.viewID);
			if(enemyPlayers[k] != player)
			{
				//Debug.Log("Iedereen behalve ikzelf");
				//Debug.Log("Uniek viewID van de enemy: " + enemyPlayers[k].GetComponent(NetworkView).viewID);
				var pvpDist = Vector3.Distance(enemyPlayers[k].transform.position, playerPos);
				if(pvpDist <= punchRadius)
				{
					pvpTargetDir = enemyPlayers[k].transform.position - playerPos;
					pvpCurrentAngle = Vector3.Angle(pvpTargetDir, player.transform.forward);
					
					if(pvpCurrentAngle <= attackAngle)
					{					
						Debug.Log("other player = "+enemyPlayers[k]+" on position "+k);
						var tempColor = Color(Random.Range(0.0,1.0),Random.Range(0.0,1.0),Random.Range(0.0,1.0));
						enemyPlayers[k].transform.Find("polySurface14").renderer.material.color = tempColor;
						enemyPlayers[k].transform.Find("polySurface19").renderer.material.color = tempColor;
						enemyPlayers[k].transform.Find("polySurface24").renderer.material.color = tempColor;
						//enemyPlayers[k].GetComponent(PlayerCombat).takeDamage(attackDamage);
						networkView.RPC("playerCheck", RPCMode.All, attackDamage, k, GameObject.FindObjectOfType(SpawnPlayerLogic).getLocalPlayer(), GameObject.FindObjectOfType(SpawnPlayerLogic).getIsMole());
						GameObject.FindObjectOfType(PunchingSound).setPlaySound();
						//Debug.Log("ID van andere player (deze ga je naar hem op sturen): " + enemyPlayers[k].GetComponent(NetworkView).networkView.viewID);
						//Debug.Log("Eigen ID: " + networkView.viewID);
					}
				}
			}
			else
			{
			}
		}
		//Debug.Log("attack enabled");
	}
	else{
		//show message that you cant attack cause the 2 seconds havent passed yet.
		//Debug.Log("attack disabled");
		
	}
	enemys = GameObject.FindGameObjectsWithTag("Enemy");
	var length = enemys.Length;
	return enemys;
}

function addPlayerHealth(enemyPlayerPos : int){

 networkView.RPC("addHealth", RPCMode.All, enemyPlayerPos);

}



@RPC

function addHealth(enemyPlayerPos : int){

	var enemyPlayers = GameObject.FindGameObjectsWithTag("Player");
	
	if (enemyPlayers.Length>0){
		if (enemyPlayers[enemyPlayerPos] == GameObject.Find("Player(Clone)")){	
			var playerMe = enemyPlayers[enemyPlayerPos].GetComponent(PlayerCombat);	
			if(playerMe.playerHealth < 100){	
				playerMe.playerHealth++;	
				GameObject.Find("Spawn").GetComponent(SpawnPlayerLogic).setNewHealth(playerMe.playerHealth);
			}	
		}
	}
}

function OnDrawGizmosSelected ()
{
	if(networkView.isMine){
		Gizmos.color = Color.green;
		Gizmos.DrawWireSphere (transform.TransformPoint(punchPosition), punchRadius);
	}
}

@RPC
function playerCheck(damage : float, enemyPlayerPos : int, sendedPlayer: NetworkPlayer, sendedIsMole : boolean)
{
	GameObject.FindObjectOfType(SpawnPlayerLogic).playerAttackedPlayer(sendedPlayer);
	GameObject.FindObjectOfType(SpawnPlayerLogic).playerAttackedByPlayerOrEmeny(sendedPlayer);

 	GameObject.FindObjectOfType(SpawnPlayerLogic).playerAttackedByPlayerOrEmenyByID(enemyPlayerPos);
	var enemyPlayers = GameObject.FindGameObjectsWithTag("Player");

	//Debug.Log("searching match..., on position "+enemyPlayerPos+", is player: "+enemyPlayers[enemyPlayerPos]);

	if (enemyPlayers[enemyPlayerPos] == GameObject.Find("Player(Clone)")){
		var tempColor = Color(Random.Range(0.0,1.0),Random.Range(0.0,1.0),Random.Range(0.0,1.0));
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface14").renderer.material.color = tempColor;
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface19").renderer.material.color = tempColor;
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface24").renderer.material.color = tempColor;
		Debug.Log("this is my object! I will receive damage");
		
		var playerMe = enemyPlayers[enemyPlayerPos].GetComponent(PlayerCombat);
		if(playerMe.playerHealth > damage)
			playerMe.playerHealth -= damage;
		else{
			Debug.Log("My health reaches below zero! Dieing.");
			if(GameObject.Find("Spawn").GetComponent(SpawnPlayerLogic).getIsMole() == false) 
			{ 	
				Debug.Log("RPC om spelers verlagen sturen");			
				networkView.RPC("sendPlayerLoss", RPCMode.AllBuffered); 			
			}
			GameObject.Find("Spawn").GetComponent(SpawnPlayerLogic).die();
			GameObject.FindObjectOfType(NetworkLevelLoad).setDieValue(1);
			Application.LoadLevel("EndScreen");
		}
		
		GameObject.Find("Spawn").GetComponent(SpawnPlayerLogic).setNewHealth(playerMe.playerHealth);
	}
	if (enemyPlayers[enemyPlayerPos] != null){
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface14").renderer.material.color = Color(1.0,0,0); 	
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface19").renderer.material.color = Color(1.0,0,0); 	
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface24").renderer.material.color = Color(1.0,0,0); 	
		yield(0.2); 	
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface14").renderer.material.color = Color(0.3,0.3,0.3); 	
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface19").renderer.material.color = Color(0.3,0.3,0.3); 	
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface24").renderer.material.color = Color(0.3,0.3,0.3); 	
		yield(0.2); 	
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface14").renderer.material.color = Color(1.0,0,0); 	
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface19").renderer.material.color = Color(1.0,0,0); 	
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface24").renderer.material.color = Color(1.0,0,0); 	
		yield(0.2); 	
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface14").renderer.material.color = Color(0.3,0.3,0.3); 	
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface19").renderer.material.color = Color(0.3,0.3,0.3); 	
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface24").renderer.material.color = Color(0.3,0.3,0.3);
		
		GameObject.FindObjectOfType(SpawnPlayerLogic).colorMoles();	
	}
}

function takeDamage(damage : int, enemyPlayerPos : int) {
	var enemyPlayers = GameObject.FindGameObjectsWithTag("Player");
	//set player in attack mode

	networkView.RPC("playerInAttackByEnemy", RPCMode.All, enemyPlayerPos);
	Debug.Log("searching match..., on position "+enemyPlayerPos+", is player: "+enemyPlayers[enemyPlayerPos]);

	if (enemyPlayers[enemyPlayerPos] == GameObject.Find("Player(Clone)")){
	
		//Play enemy attack sound
		GameObject.FindObjectOfType(EnemyAttackSound).setPlaySound();
	
		var tempColor = Color(Random.Range(0.0,1.0),Random.Range(0.0,1.0),Random.Range(0.0,1.0));
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface14").renderer.material.color = tempColor;
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface19").renderer.material.color = tempColor;
		enemyPlayers[enemyPlayerPos].transform.Find("polySurface24").renderer.material.color = tempColor;
		Debug.Log("this is my object! I will receive damage");
		
		var playerMe = enemyPlayers[enemyPlayerPos].GetComponent(PlayerCombat);
		if(playerMe.playerHealth > damage)
			playerMe.playerHealth -= damage;
		else{
			Debug.Log("My health reaches below zero! Dieing.");
			GameObject.Find("Spawn").GetComponent(SpawnPlayerLogic).die();
			GameObject.FindObjectOfType(NetworkLevelLoad).setDieValue(1);
			Application.LoadLevel("EndScreen");
		}
		
		GameObject.Find("Spawn").GetComponent(SpawnPlayerLogic).setNewHealth(playerMe.playerHealth);
	}
	
	enemyPlayers[enemyPlayerPos].transform.Find("polySurface14").renderer.material.color = Color(1.0,0,0); 	
	enemyPlayers[enemyPlayerPos].transform.Find("polySurface19").renderer.material.color = Color(1.0,0,0); 	
	enemyPlayers[enemyPlayerPos].transform.Find("polySurface24").renderer.material.color = Color(1.0,0,0); 	
	yield(0.2); 	
	enemyPlayers[enemyPlayerPos].transform.Find("polySurface14").renderer.material.color = Color(0.3,0.3,0.3); 	
	enemyPlayers[enemyPlayerPos].transform.Find("polySurface19").renderer.material.color = Color(0.3,0.3,0.3); 	
	enemyPlayers[enemyPlayerPos].transform.Find("polySurface24").renderer.material.color = Color(0.3,0.3,0.3); 	
	yield(0.2); 	
	enemyPlayers[enemyPlayerPos].transform.Find("polySurface14").renderer.material.color = Color(1.0,0,0); 	
	enemyPlayers[enemyPlayerPos].transform.Find("polySurface19").renderer.material.color = Color(1.0,0,0); 	
	enemyPlayers[enemyPlayerPos].transform.Find("polySurface24").renderer.material.color = Color(1.0,0,0); 	
	yield(0.2); 	
	enemyPlayers[enemyPlayerPos].transform.Find("polySurface14").renderer.material.color = Color(0.3,0.3,0.3); 	
	enemyPlayers[enemyPlayerPos].transform.Find("polySurface19").renderer.material.color = Color(0.3,0.3,0.3); 	
	enemyPlayers[enemyPlayerPos].transform.Find("polySurface24").renderer.material.color = Color(0.3,0.3,0.3);
	
	GameObject.FindObjectOfType(SpawnPlayerLogic).colorMoles();	
}

@RPC 
function sendPlayerLoss(){ 	
	Debug.Log("playersLeft vóór aftrekking: "+PlayerPrefs.GetInt("playersLeft"));
	PlayerPrefs.SetInt("playersLeft", PlayerPrefs.GetInt("playersLeft") - 1); 	
	Debug.Log("playersLeft ná aftrekking: "+PlayerPrefs.GetInt("playersLeft"));
	if(PlayerPrefs.GetInt("playersLeft") <= 3)	 
	{ 		
		//Debug.Log("te weinig spelers om nog te winnen - game over. Mole: "+GameObject.Find("Spawn").GetComponent(SpawnPlayerLogic).getIsMole());
		if(GameObject.Find("Spawn").GetComponent(SpawnPlayerLogic).getIsMole() == false)
		{ 			
			Debug.Log("Hier verlies je omdat je geen mol bent");
			//PlayerPrefs.SetInt("playerDied", 1);
			//PlayerPrefs.SetInt("playerWon", 0);
			GameObject.FindObjectOfType(NetworkLevelLoad).setDieValue(1);
			Application.LoadLevel("EndScreen"); 		
		} 		
		else
		{ 	
			Debug.Log("Je wint omdat je mol bent");
			
			//PlayerPrefs.SetInt("playerWon", 1);
			//PlayerPrefs.SetInt("playerDied", 2); 
			GameObject.FindObjectOfType(NetworkLevelLoad).setDieValue(2);
			Application.LoadLevel("EndScreen"); 		
		} 	
	} 
}

function OnGUI () {
	//var myPlayerCombat = GameObject.Find("Player(Clone)").GetComponent(PlayerCombat);
	//GUI.Box(new Rect(10,10,Screen.width/2/(startHealth/playerHealth), 20), startHealth+"/"+playerHealth);
}

@RPC

function playerInAttackByEnemy(enemyPlayerPos : int){

 GameObject.FindObjectOfType(SpawnPlayerLogic).playerAttackedByPlayerOrEmenyByID(enemyPlayerPos);

}