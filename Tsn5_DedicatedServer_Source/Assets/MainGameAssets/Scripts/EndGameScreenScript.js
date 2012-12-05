var buttonSkin : GUISkin;
var guitext_die : GUIText;
var guitext_won : GUIText;

function Awake(){
	Debug.Log("died value: "+GameObject.FindObjectOfType(NetworkLevelLoad).getDieValue());
}

function OnGUI(){
var diedValue = GameObject.FindObjectOfType(NetworkLevelLoad).getDieValue();
	if(diedValue == 2)
	{
		GUI.skin = buttonSkin;
		guitext_won.text = "Congratulations!!! \n You've escaped the mad system.";
		//GUI.Window(0, Rect(150,350,250,100),winText, "");
		if(GUI.Button(Rect(100,300,558,88), "Return to main menu"))
		{
			GameObject.FindObjectOfType(NetworkLevelLoad).setDieValue(0);
	  		guitext_won.text = "";
	  		Application.LoadLevel("MasterServer");
		}
	}
	else if(diedValue == 1)
	{
		GUI.skin = buttonSkin;    
		guitext_die.text = "Game over. \n You have died.";
		//GUI.Window(1, Rect(100,150,550,500), dieText, "");
		if(GUI.Button(Rect(100,300,558,88), "Return to main menu"))
		{
	 		GameObject.FindObjectOfType(NetworkLevelLoad).setDieValue(0);
	  		guitext_die.text = "";
	  		Application.LoadLevel("MasterServer");
		}
	}
}

function Update () {
}