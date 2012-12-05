function OnGUI(){
	GUI.Label(new Rect((Screen.width/2)-80, (Screen.width/2)-130,200,50), "SELECT CONNECTION TYPE");
	GUI.Label(new Rect((Screen.width/220), (Screen.width/30),220,30), "KOEKJES ZIJN LEKKER!");
	
	if (GUI.Button(new Rect((Screen.width/2)-100,(Screen.height/2)-100,200,50), "Master Server Connection")){
		Application.LoadLevel("MasterServer");
	}
}

function Update () {
}