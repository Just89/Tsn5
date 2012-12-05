var spawnTile : Transform;
var boilerTile : Transform;
var pronoTile : Transform;
var kantineTile : Transform;
var endTile : Transform;
var Enemy : Transform;
var treasureObject : Transform;
var keyLock : Transform;

private var endTileClone : Transform;
private var keyLockClone : Transform;


var hexagonTile : Transform;
var rot : Quaternion = Quaternion.identity;
private var lockRot : Quaternion;
var tileArray : Array = new Array();
public var treasureArray : Array = new Array();
public var spawnArray : Array = new Array();
var tileKind : Array = new Array();

var tilesZ = 10;
var tilesX = 10;

public var treasures:Array = new Array();
var numTreasures:int = 42;

var player;
var spawnObjectLogic;

var gameLoaded:boolean = false;

private var firsttimeend : boolean = true;

function Start () 
{	
	//Only make the grid on the server, pass it to the clients
	if(Network.isServer)
	{		
		for(t = 0; t < tilesZ*tilesX; t++){
			if(t==0 || t == tilesX-1 || t == tilesZ*tilesX-1 || t== tilesZ*(tilesX-1)){
				tileKind.Push(0);
			}else if(t == (Mathf.Round(tilesZ*tilesX / 2))){
			   tileKind.Push(6);
			}else{ 
				tileKind.push(Random.Range(1, 5));
			}
		}
		var tileKindString:String = "";
		for(k = 0; k < tileKind.length; k++){
			if(k != tileKind.length)
				tileKindString += tileKind[k]+"-";
			else
				tileKindString += tileKind[k];
		}
		
		var treasureString:String = "";
		var sArray:Array = selectTreasureTiles();
		for(s = 0; s < sArray.length; s++){
			if(s != sArray.length)
				treasureString += sArray[s]+"-";
			else
				treasureString += sArray[s];
		}
		
		networkView.RPC("GeefArraysDoor", RPCMode.AllBuffered, treasureString, tileKindString);
	}
}

@RPC
function GeefArraysDoor(treasureString:String, tileKindString:String){
	var tileKind:Array = tileKindString.Split("-"[0]);
	var networkTreasures:Array = treasureString.Split("-"[0]);
	
	//Debug.Log("arrays door gegeven."+tileKind+"."+networkTreasures);
	var difx:float;
	var difZ:float;

	for(z = 0; z < tilesZ; z++)
	{
		for(x = 0; x < tilesX; x++)
		{
			if(z%2 == 0){
				difx = hexagonTile.renderer.bounds.size.z / 3.462;
				difZ = hexagonTile.renderer.bounds.size.z / 2; 
			}else{
				difx = hexagonTile.renderer.bounds.size.z / 3.462;
				difZ = 0;
			}
			
			
			//clone.renderer.material.color = Color(Random.Range(0.0,1.0), Random.Range(0.0,1.0), Random.Range(0.0,1.0), 1);
			if(tileKind[z * tilesZ + x] == "0"){
				clone = Instantiate(spawnTile,new Vector3(z * hexagonTile.renderer.bounds.size.x - (difx*z), 0, x * hexagonTile.renderer.bounds.size.z + difZ), rot);
				spawnArray.push(clone.transform.position);
			}else if(tileKind[z * tilesZ + x] == "1"){
				clone = Instantiate(boilerTile,new Vector3(z * hexagonTile.renderer.bounds.size.x - (difx*z), 0, x * hexagonTile.renderer.bounds.size.z + difZ), rot);
			}else if(tileKind[z * tilesZ + x] == "2"){
				clone = Instantiate(kantineTile,new Vector3(z * hexagonTile.renderer.bounds.size.x - (difx*z), 0, x * hexagonTile.renderer.bounds.size.z + difZ), rot);
				//clone.renderer.material.color = Color.blue;
			}else if(tileKind[z * tilesZ + x] == "3"){
				clone = Instantiate(pronoTile,new Vector3(z * hexagonTile.renderer.bounds.size.x - (difx*z), 0, x * hexagonTile.renderer.bounds.size.z + difZ), rot);
				//clone.renderer.material.color = Color.green;
			}else if(tileKind[z * tilesZ + x] == "4"){
				clone = Instantiate(boilerTile,new Vector3(z * hexagonTile.renderer.bounds.size.x - (difx*z), 0, x * hexagonTile.renderer.bounds.size.z + difZ), rot);
				//clone.renderer.material.color = Color.magenta;
			}else if(tileKind[z * tilesZ + x] == "5"){
				clone = Instantiate(boilerTile,new Vector3(z * hexagonTile.renderer.bounds.size.x - (difx*z), 0, x * hexagonTile.renderer.bounds.size.z + difZ), rot);
				//clone.renderer.material.color = Color.yellow;
			}else if(tileKind[z * tilesZ + x] == "6"){
				clone = Instantiate(endTile,new Vector3(z * hexagonTile.renderer.bounds.size.x - (difx*z), 0, x * hexagonTile.renderer.bounds.size.z + difZ), lockRot);
   				endTileClone = clone;
   				keyLockClone = Instantiate(keyLock, new Vector3(48.17805, 3.797344, 71.53072), lockRot);
			}else{
				Debug.Log("NO COLOR!");
			}
			
			tileArray[z * tilesZ + x] = clone;
			yield;
		}
	}
	
	if(Network.isServer){
		//placeTreasures(networkTreasures);
		//placePlayers();
		placeEnemies();
	}else{
		//getTreasures(networkTreasures);
		colorEnemies();
	}
	
	GameObject.FindWithTag("Spawn").GetComponent(SpawnPlayerLogic).mainScript = this;
	
	gameLoaded = true;
}

/*function placePlayers(){
	spawnObjectLogic = GameObject.FindWithTag("Spawn").GetComponent(SpawnPlayerLogic);
	
	if (Network.connections.Length > 0) {
		for (var p : NetworkPlayer in Network.connections) {
			//Debug.Log("Resending player init to "+p);
			Debug.Log("players were connected already, inniting! spawnArray.length: "+spawnArray.length);
			spawnObjectLogic.connectPlayer(p);
		}
	}
}*/

function placeEnemies(){
	var i = 0;
	for(tile in tileArray){
		//Debug.Log("Span Enemy");
		if(tileKind[i] != 0 && tileKind[i] != 6){
			
			clone = Network.Instantiate(Enemy, tile.transform.position, transform.rotation, 0);
			var rootJointComponent = clone.transform.Find("rootJoint");
			if (rootJointComponent){
				rootJointComponent.renderer.material.color = Color.blue;
			}
			//Debug.Log("Spawn enemy "+tileKind[i]);
		}
		i++;
	}
	
	
}

function colorEnemies(){
	var enemyObjects = GameObject.FindGameObjectsWithTag("Enemy");
	for(enemy in enemyObjects){
		var rootJointComponent = enemy.transform.Find("rootJoint");
		if (rootJointComponent){
			rootJointComponent.renderer.material.color = Color.blue;
		}
	}
}

function selectTreasureTiles(){
	var numTiles: int = tilesZ*tilesX;
	var random:int;
	var isNew:boolean;
	
	for (var i:int; i < numTreasures; i++){
		isNew = true;
		random = Random.Range(0, numTiles);
		for (var j:int; j < treasures.length; j++){
			if (random == treasures[j] || tileKind[random] == "0" ){
				isNew = false; 
				i--;
			}
		}
	
		if (isNew == true){
			treasures.push(random);
		}
	}
	
	return treasures;
}

function placeTreasures(treasures:Array){
	for(i=0; i < treasures.length; i++){
		if(treasures[i] != ""){
			var treasure = tileArray[parseInt(treasures[i])];
			
			treasureClone = Network.Instantiate(treasureObject, new Vector3(treasure.transform.position.x, treasureObject.renderer.bounds.size.z, treasure.transform.position.z), rot, 0);
			treasureClone.gameObject.layer = 9;
			
			treasureClone.GetComponent(PickupScript).onTileNr = parseInt(treasures[i]);
			treasureClone.GetComponent(PickupScript).treasureNr = i;
			
			treasureArray.push(treasureClone);
		}
	}
}

function dropOwnTreasure(pos : Vector3, tile : int, numRelic : int){
	Debug.Log("on tile nr "+tile);
	treasureArray[numRelic].gameObject.layer = 0;
	pos = Vector3(pos.x,pos.y+1,pos.z);
	treasureArray[numRelic].gameObject.transform.position = pos;
	treasureArray[numRelic].GetComponent(PickupScript).onTileNr = tile;
	treasureArray[numRelic].GetComponent(PickupScript).isPicked = false;
	var posToString : String = pos.x+","+pos.y+","+pos.z;
	
	

	networkView.RPC("dropTreasure", RPCMode.AllBuffered, numRelic, tile, posToString);
}

@RPC
public function dropTreasure(numRelic : int, tile : int, posString : String){
	//Debug.Log("posString "+posString);	

	var pos : Array = posString.Split(","[0]);
	treasureArray[numRelic].gameObject.transform.position.x = parseFloat(pos[0]);
	treasureArray[numRelic].gameObject.transform.position.y = parseFloat(pos[1]);
	treasureArray[numRelic].gameObject.transform.position.z = parseFloat(pos[2]);
	treasureArray[numRelic].gameObject.GetComponent(MeshCollider).enabled = true;
	
	treasureArray[numRelic].gameObject.layer = 0;
	treasureArray[numRelic].GetComponent(PickupScript).onTileNr = tile;
	treasureArray[numRelic].GetComponent(PickupScript).isPicked = false;
}

function getTreasures(tr:Array){
	for(i=0; i < tr.length; i++){
		if(tr[i] != ""){
			treasures.push(parseInt(tr[i]));
		}
	}

	var treasuresGet = GameObject.FindGameObjectsWithTag("Treasure");
	var j = 0;
	for (var t in treasuresGet){
		t.renderer.material.color = Color(Random.Range(0.0,1.0), Random.Range(0.0,1.0), Random.Range(0.0,1.0), 1);
		t.gameObject.layer = 9;
		t.gameObject.GetComponent(PickupScript).onTileNr = parseInt(tr[j]);
		t.gameObject.GetComponent(PickupScript).treasureNr = j;
		
		treasureArray.push(t);
		//Debug.Log("Layer "+t.gameObject.layer);
		j++;
	}
	
	//Debug.Log("Aantal treasures: "+treasures.length);
}

function Update () {
	if (!player){
		player = GameObject.Find("Player(Clone)");
	}
	
	if(player && gameLoaded){
	var playerIsOnTile = false;
	for(i=0; i < tileArray.length; i++)
	{
		//check if x and z is binnen een hex
		tile = tileArray[i];
		if(onSurface(player.transform.position.x, player.transform.position.z, tile.transform.position.x, tile.transform.position.z, tile.renderer.bounds.size.x )){
			playerIsOnTile = true;
			player.GetComponent(ThirdPersonController).myTile = i;
			/*tile.renderer.material.shader = Shader.Find("Diffuse");
			if (tile.renderer.material.color.a < 1){
        		tile.renderer.material.color.a += 0.05;
        	}else if(tile.renderer.material.color.a >= 1){
        		tile.renderer.material.color.a = 1;
			}*/
			for(j=0; j < treasures.length; j++){
			//treasures[j] == i
				if(treasureArray[j].gameObject.GetComponent(PickupScript).onTileNr == player.GetComponent(ThirdPersonController).myTile && treasureArray[j] != null && !treasureArray[j].GetComponent(PickupScript).isPicked){
					treasureArray[j].gameObject.layer = 0;
				}else{
					treasureArray[j].gameObject.layer = 9;
				}
			}
		}else{
			/*tile.renderer.material.shader = Shader.Find("Transparent/Diffuse");
			if (tile.renderer.material.color.a > 0.04){
        		tile.renderer.material.color.a -= 0.02;
        	}else if(tile.renderer.material.color.a <= 0.04){
        		tile.renderer.material.color.a = 0.04;
        	}*/
        	for(j=0; j < treasures.length; j++){
				if(treasures[j] == i && treasureArray[j] != null && !treasureArray[j].GetComponent(PickupScript).isPicked){
					treasureArray[j].gameObject.layer = 9;
				}
			}
		}
		
		if(onSurface(player.transform.position.x, player.transform.position.z, endTileClone.transform.position.x, endTileClone.transform.position.z, endTileClone.renderer.bounds.size.x)){
		  	keyLockClone.gameObject.layer = 0;
		  	//tips
		  	if(firsttimeend){
		  		Debug.Log("Show tip");
		  		GameObject.Find("Hints").GetComponent(Hint).enterEndTile();
	  		}
	  		firsttimeend = false;
		}else{
		  	keyLockClone.gameObject.layer = 9;
		  	firsttimeend = true;
		}
		
		if(onSurface(player.transform.position.x, player.transform.position.z, tile.transform.position.x, tile.transform.position.z, tile.renderer.bounds.size.x )){
			tile.gameObject.layer = 0;
		}else{
			tile.gameObject.layer = 9;
		}
	}
	
	if(!playerIsOnTile){
		player.GetComponent(ThirdPersonController).myTile = 9999;
	}
	
	var otherPlayerGet = GameObject.FindGameObjectsWithTag("Player");
	
	for (var otherPlayer  in otherPlayerGet)
	{
		if (player.GetComponent(ThirdPersonController).myTile != 9999) {
			currentTile = tileArray[player.GetComponent(ThirdPersonController).myTile];	
			if(!otherPlayer.networkView.isMine)
			{	
				if(onSurface(otherPlayer.transform.position.x, otherPlayer.transform.position.z, currentTile.transform.position.x, currentTile.transform.position.z, currentTile.renderer.bounds.size.x ))
				{
					ChangeLayersRecursively(otherPlayer.gameObject.transform, "Default");
				}else{
					ChangeLayersRecursively(otherPlayer.gameObject.transform, "NonVissible");
				}
			}
		}
	}
	var enemyGet = GameObject.FindGameObjectsWithTag("Enemy");
 
		for (var enemies  in enemyGet)
	  	{
	  		if (player.GetComponent(ThirdPersonController).myTile != 9999) {
		   		currentTile = tileArray[player.GetComponent(ThirdPersonController).myTile]; 
			   	if(onSurface(enemies.transform.position.x, enemies.transform.position.z, currentTile.transform.position.x, currentTile.transform.position.z, currentTile.renderer.bounds.size.x ))
			   	{
			    	ChangeLayersRecursively(enemies.gameObject.transform, "Default");
			   	}else{
			    	ChangeLayersRecursively(enemies.gameObject.transform, "NonVissible");
			   	}
			}	
		}
	}
	
	//Debug.Log("new spawnArray.length: "+spawnArray.length);
}

function checkEnemyTile(transform : Transform){
	for(i=0; i < tileArray.length; i++){
		//check if x and z is binnen een hex
		tile = tileArray[i];
		if(onSurface(transform.position.x, transform.position.z, tile.transform.position.x, tile.transform.position.z, tile.renderer.bounds.size.x )){
			return i;
		}
	}
}

function ChangeLayersRecursively(trans : Transform, name : String)
{
   for (var child : Transform in trans)
   {
       child.gameObject.layer = LayerMask.NameToLayer(name);
       ChangeLayersRecursively(child, name);
   }
}

function onSurface(playerX:float, playerY:float, hexagonX:float, hexagonY:float, hexagonWidth:float):boolean{
	
	y = playerY-hexagonY;
	x = playerX-hexagonX; 
	scaleY = hexagonWidth/4;
	scaleX = hexagonWidth/4;
	
	//SQUARE
	if (y > -Mathf.Sqrt(3) * scaleY && 
		y < Mathf.Sqrt(3) * scaleY &&
		x > -1 * scaleX && 
		x < 1 * scaleX)
	{
		return true;
	}
	
	if (y > -Mathf.Sqrt(3) * scaleY && 
		y < 0  &&
		x < (-1 * scaleX) &&
		x > (-1 * scaleX) - (Mathf.Tan(30*Mathf.Deg2Rad) * ((Mathf.Sqrt(3) * scaleY) + y))) // tan30 * root of 3 plus the y (which in this case (left bottom) will always be negative)*/
	{
		return true;
	}
	
	//LEFT TOP
	if (y > 0 &&
		y < (Mathf.Sqrt(3) * scaleY) &&
		x < (-1 * scaleX) &&
		x > (-1 * scaleX) - (Mathf.Tan(30*Mathf.Deg2Rad) * ((Mathf.Sqrt(3) * scaleY) - y)))
	{
		return true;
	}
	//RIGHT BOTTOM
	if (y < 0 &&
		y > (-Mathf.Sqrt(3) * scaleY) &&
		x > (1 * scaleX) &&
		x < (1 * scaleX) + (Mathf.Tan(30*Mathf.Deg2Rad) * ((Mathf.Sqrt(3) * scaleY) + y))) //y will always be negative again
	{
		return true;
	}
	//RIGHT TOP
	if (y > 0 &&
		y < (Mathf.Sqrt(3) * scaleY) &&
		x > (1 * scaleX) &&
		x < (1 * scaleX) + (Mathf.Tan(30*Mathf.Deg2Rad) * ((Mathf.Sqrt(3) * scaleY) - y)))
	{
		return true;
	}
	
	return false;
}