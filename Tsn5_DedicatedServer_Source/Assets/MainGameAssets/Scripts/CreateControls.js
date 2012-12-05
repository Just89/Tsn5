var buttonSkin : GUISkin;
var buttonTexture : Texture2D;
var cursorImage : Texture;

function OnGUI(){

	cameraObject = GameObject.Find("Main Camera").camera;
	cameraObject.clearFlags = CameraClearFlags.SolidColor;
	cameraObject.backgroundColor = Color(0.2, 0.2, 0.2, 1);

	GUI.skin = buttonSkin;
	
	GUI.skin.box.normal.background = buttonTexture;
	GUI.skin.box.fontSize = 14;
	GUI.skin.box.alignment = UnityEngine.TextAnchor.MiddleLeft;
	GUI.Label(Rect(40, 40,300,40), "Sound");
	GUI.Box(Rect(40, 80,558,44), "Master volume");
	GUI.Box(Rect(40, 120,558,44), "Ambient sounds");
	
	GUI.Label(Rect(40, 200,300,40), "Controls");
	GUI.Box(Rect(40, 240,558,44), "Move up");
	GUI.Box(Rect(40, 280,558,44), "Move down");
	GUI.Box(Rect(40, 320,558,44), "Move left");
	GUI.Box(Rect(40, 360,558,44), "Move right");
	GUI.Box(Rect(40, 400,558,44), "Punch");
	
	
	if(GUI.Button(Rect(40, Screen.height-120,558,88), "Back")){
		//Destroy(GameObject.Find("ConnectionGUI"));
		//Application.LoadLevel("MasterServer");
		Application.LoadLevel("MainGame");
	}
	
	var mousePos : Vector3 = Input.mousePosition;
    var pos : Rect = Rect(mousePos.x,Screen.height - mousePos.y,cursorImage.width,cursorImage.height);
    GUI.Label(pos,cursorImage);
	
}