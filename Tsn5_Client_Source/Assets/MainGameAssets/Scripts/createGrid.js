var hexagonTile : Transform;

var rot : Quaternion = Quaternion.identity;
var tileArray : Array = new Array();

var tilesZ = 10;
var tilesX = 10;

var player;

function Start () 
{	
	player = GameObject.Find("Player(Clone)");

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
			
			clone = Instantiate(hexagonTile,new Vector3(z * hexagonTile.renderer.bounds.size.x - (difx*z), 0, x * hexagonTile.renderer.bounds.size.z + difZ), rot);
			clone.renderer.material.color = Color(0,0,0, 1);
			//clone.renderer.material.color = Color(Random.Range(0.0,1.0), Random.Range(0.0,1.0), Random.Range(0.0,1.0), 1);
			
			tileArray[z * tilesZ + x] = clone;
		}
	}
	
}

function Update () {
	player = GameObject.Find("Player(Clone)");
	if(player){
		//Debug.Log("x = "+GameObject.FindWithTag("Player").transform.position.x+"y = "+GameObject.FindWithTag("Player").transform.position.y+"z = "+GameObject.FindWithTag("Player").transform.position.z);
		for(i=0; i < tileArray.length; i++){
			//check if x and z is binnen een hex
			tile = tileArray[i];
			if(onSurface(player.transform.position.x, player.transform.position.z, tile.transform.position.x, tile.transform.position.z, tile.renderer.bounds.size.x )){
				tile.renderer.material.color = Color(2.43, 1.46, 0, 1);
			}
		}
	}
}

function onSurface(playerX:float, playerY:float, hexagonX:float, hexagonY:float, hexagonWidth:float):boolean{
	y = playerY-hexagonY;
	x = playerX-hexagonX; 
	scaleY = hexagonWidth/4;
	scaleX = hexagonWidth/4;
	
	//Debug.Log("Scale: "+hexagonWidth+", playerX: "+playerX+", playerY: "+playerY);
	//Debug.Log(Mathf.Sqrt(3));
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