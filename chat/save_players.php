<?php
$myFile = "count.json";
//$stripped = stripslashes($myFile);
$filetje = file_get_contents($myFile);
$json = json_decode($filetje, TRUE);

$fh = fopen($myFile, "w") or die("can't open file");
//$stringData = $_REQUEST["data"];
//var_dump(json_decode($filetje));

$current_count = (int)$json["count"];
//echo $current_count;

++$current_count;
//echo $current_count;

$json_new = array("count"=> $current_count);

$json_response = array("set_attributes" => array("count"=> $current_count));
echo json_encode($json_response);

$stringData = json_encode($json_new);
fwrite($fh, $stringData);
fclose($fh);

// create file with user name as filename, for now random test
$randomFileName = substr(md5(rand()), 0, 7);

file_put_contents($randomFileName, $randomFileName);
?>