private var isHighlighted : boolean = false;
private var isPicked : boolean = false;
private var gameCharacter : GameObject; 
private var gameCharacterTransform : Transform; 
private var gameCharacterTPC : ThirdPersonController; 
private var SpawnPlayerLogicScript : SpawnPlayerLogic;
private var distance : float;
public var onTileNr : int;
public var treasureNr : int;

function Start() { 
   //Debug.Log("TOUCHDOWN");
   treasure = gameObject;  
} 

function OnMouseEnter() { 
	//Debug.Log("HOVER");
   if(distance <= 4.0) { 
      //CreateInfoName();
      isHighlighted = true; 
   } 
} 

function OnMouseExit() { 
   //Destroy(GameObject.Find("infoName")); 

   isHighlighted = false; 
} 


function OnMouseDown(){
	if(distance <= 4.0) {
		//networkView.RPC("setRelic", RPCMode.Server);
		if (SpawnPlayerLogicScript.getHasRelic() == false)
		{
			SpawnPlayerLogicScript.setHasRelic(true);
			SpawnPlayerLogicScript.setNumRelic(treasureNr);
			
			/*gameCharacterTPC.walkSpeed *= 0.5;
			gameCharacterTPC.trotSpeed *= 0.5;
			gameCharacterTPC.runSpeed *= 0.5;*/
			
			//GameObject.Find("Spawn").networkView.RPC("ApplyGlobalChatText", RPCMode.Others, "Treasure found!", 0);
			
			networkView.RPC("deleteTreasure", RPCMode.AllBuffered, treasureNr);
			
			GameObject.Find("Hints").GetComponent(Hint).pickUpKey();
			
		} else {
			Debug.Log("Already has a relic!");
		}
    } 	
}

function Update () {
	if(gameCharacterTransform != null){
  	 	distance = Mathf.Sqrt((gameCharacterTransform.position - transform.position).sqrMagnitude);
  	}
  	
  	if(gameCharacter == null){
  		//Debug.Log("SET pickup player transfrom "+gameCharacter);
  		gameCharacter = GameObject.Find("Player(Clone)");
	}else if(gameCharacterTransform == null){
		gameCharacterTransform = gameCharacter.GetComponent(Transform);
    	gameCharacterTPC = gameCharacter.GetComponent(ThirdPersonController);
    	SpawnPlayerLogicScript = GameObject.Find("Spawn").GetComponent(SpawnPlayerLogic);
	}
} 

function CreateInfoName(){ 
   var infoName = new GameObject("infoName"); 
   infoName.AddComponent(GUIText); 
   infoName.GetComponent(GUIText).text = gameObject.name+" - "+distance; 
   infoName.transform.position = Vector3(0.5, 0.5, 0); 
   infoName.GetComponent(GUIText).alignment = TextAlignment.Center; 
   infoName.GetComponent(GUIText).anchor = TextAnchor.LowerCenter; 
   infoName.GetComponent(GUIText).pixelOffset = Vector2 (0, 25); 
}

@RPC
public function deleteTreasure(treas : int){
	//Debug.Log(treas);
	gameObject.GetComponent(MeshCollider).enabled = false;
	var grid = GameObject.FindWithTag("Grid");
	var mainScript = grid.GetComponent(main);
	var treasureArray : Array = mainScript.treasureArray;

	treasureArray[treas].gameObject.layer = 9;
	treasureArray[treas].GetComponent(PickupScript).isPicked = true;
}