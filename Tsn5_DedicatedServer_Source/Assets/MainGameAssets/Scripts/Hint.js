var show : boolean = true;
var normal : boolean = true;
var syco = false;
var hintText : String[];
var hintImage : Texture[];
var sycoText : String[];
var sycoImage : Texture[];
var hintInterval : int = 7;
var gotAKey : String;
var endTileHintText : String;
var hintIndex : int = 0;
var sycoIndex : int = -1;
var endTileHint : GUIText;

var screenHint : GUIText;
var image : GUITexture;

var timer : float = 0;
var objectHint : GameObject;
var isSycophant : boolean = false;
var spawn : GameObject;
var mole : boolean;
var temp;
var pickupText : GUIText;
var pickuptiptime : double;
private var pickuptimeleft : double = 0;
var endtiptime : double;
private var endtimeleft : double = 0;
var player : GameObject;
var tooltip;
var tooltipTimer : float = 0;

function start() {
	temp = spawn.GetComponent(SpawnPlayerLogic);
}

function pickUpKey(){	
	pickuptimeleft = pickuptiptime;
	endTileHint.text = gotAKey;
}

function enterEndTile(){
	endtimeleft = endtiptime;
	endTileHint.text = endTileHintText;
}

function Update () {

	if (player == null) {
		player = GameObject.Find("Player(Clone)");
	}
	
	if(temp == null){
		temp = spawn.GetComponent(SpawnPlayerLogic);
	}else{
		try{
			mole = temp.getIsMole();
		}catch(err){
		}
	}
	
	var treasures = GameObject.FindGameObjectsWithTag("Treasure");
	for (treasure in treasures) {
		if (treasure.layer == 0) {
			try
			{
				offset = Vector3.Distance(player.transform.position, treasure.transform.position);
				if (offset < 10) {
					if (tooltip == null) {
						tooltip = Instantiate(objectHint, treasure.transform.position, Quaternion.identity);
						tooltip.GetComponent(ObjectLabel).target = treasure.transform;
	//					tooltip.GetComponent(ObjectLabel).offset = 3;
						tooltip.GetComponent(GUIText).text = "This is a key!";
					}
				}
			}catch(e){
				
			}
		}
	}
	if (tooltip != null && tooltipTimer < 5) {
		tooltipTimer += Time.deltaTime;
	} else if (tooltipTimer >= 5) {
		Destroy(tooltip);
	}
	
	if(pickuptimeleft > 0){
		pickuptimeleft -= Time.deltaTime;
		if(pickuptimeleft <= 0){
			endTileHint.text = "";
		}
	}
	
	if(endtimeleft > 0){
		Debug.Log("aftellen" + Time.deltaTime);
		endtimeleft -= Time.deltaTime;
		Debug.Log(endtimeleft);
		if(endtimeleft <= 0){
			Debug.Log("leeg maken nu");
			endTileHint.text = "";
		}
	}
	
	if (normal) {
		screenHint.text = hintText[hintIndex];
		image.texture = hintImage[hintIndex];
	}
	
	if (timer < hintInterval) {
		timer += Time.deltaTime;
	} else {
		timer = 0;
		if (hintIndex < hintText.Length - 1) {
			hintIndex++;
		} else if (sycoIndex < sycoText.Length - 1 && mole) {
			//Debug.Log("syco");
			normal = false;
			sycoIndex++;
			screenHint.text = sycoText[sycoIndex];
			image.texture = sycoImage[sycoIndex];
		} else {
			normal = true;
			hintIndex = 0;
			sycoIndex = 0;
		}
	}
}