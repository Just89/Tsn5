var strengthPercentage : GUIText;
var strengthPercentageText : GUIText;
var strengthPercentageValue : int = 100;
var remainingMoles : GUIText;
var remainingMolesText : GUIText;
var remainingMolesValue : int;
var spawnplayerlogic : SpawnPlayerLogic;

var escaped : GUIText;
var escapedText : GUIText;
var escapedNumber : int = 0;
var remaining : GUIText;
var remainingPlayersText : GUIText;
var remainingPlayers : int = 0;
var keysFound : GUIText;
var keysFoundText : GUIText;
var keysFoundNumber : int = 0;

var sycophantsText : GUIText;
var prisonersText : GUIText;

function Start() 
{
	spawnplayerlogic = GameObject.FindObjectOfType(SpawnPlayerLogic);
	
	prisonersText.transform.position = new Vector2(0.013,0.93);
	sycophantsText.transform.position = new Vector2(0.185,0.93);
	
	escaped.transform.position = new Vector2(0.013,0.90); //hier komt de var in
	escapedText.transform.position = new Vector2(0.045,0.90); //dit is de tekst
	
	remaining.transform.position = new Vector2(0.013,0.87);
	remainingPlayersText.transform.position = new Vector2(0.045,0.87);
	
	keysFound.transform.position = new Vector2(0.013,0.84);
	keysFoundText.transform.position = new Vector2(0.045,0.84);
	
	strengthPercentage.transform.position = new Vector2(0.185,0.90);
	strengthPercentageText.transform.position = new Vector2(0.247,0.90);
	
	remainingMoles.transform.position = new Vector2(0.185,0.87);
	remainingMolesText.transform.position = new Vector2(0.247,0.87);
}

function Update () 
{
	var playerList = spawnplayerlogic.getPlayerList();
	var numberOfMoles : int = 0;
	remainingPlayers = 0;
	keysFoundNumber = 0;
	for (player in playerList) 
	{
		if (player.isMole) 
		{
			numberOfMoles++;
			if(player.hasRelic)
			{
				keysFoundNumber++;
			}
		}
		else
		{
			remainingPlayers++;
			if(player.hasRelic)
			{
				keysFoundNumber++;
			}
		}
	}
	remainingMoles.text = numberOfMoles.ToString();
	
	strengthPercentageValue = PlayerPrefs.GetInt("strength");
	strengthPercentage.text = strengthPercentageValue + "%"; //text is percentage
	
	escapedNumber = PlayerPrefs.GetInt("playersEscaped");
	escaped.text = escapedNumber+"";
	
	remaining.text = remainingPlayers +"";
	
	keysFound.text = keysFoundNumber+"";
}