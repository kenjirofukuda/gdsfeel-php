/^[0-9]+ [A-Z]+/ {
 	printf("const %s = %s;\n", $2, $1)
}
