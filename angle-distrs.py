import random
import math

a = []
a_offset = []
offset = 0
bimodal = True
k = 1
mu = math.pi # i.e., 180 degrees
num = 1000000

# setup output array
for i in range(36):
	a.append(0.0)
	a_offset.append(0.0)	

# run sampling
print "running"
for i in range(num):	
	if bimodal:
		x = random.vonmisesvariate(mu,k) / 2 + random.randint(0,1) * math.pi 
	else:
		x = random.vonmisesvariate(mu,k)
	bin = int(36 * x/(2  * math.pi)) # should be 0 to 35
	try:
		a[bin] = a[bin] + 1
	except:
		a[bin] = 0

#normalize
for i in range(36):
	a[i]= float(a[i])/float(num)
	if a[i] < 0.0001:
		a[i] = 0

# translate
print "i, i + offset, a[i],  a[i + offset - 36],a_offset[i]"
for i in range(36):
	a_offset[i] = a[(i + offset) % 36]


#print to screen
print "distribution:"
sumprobs = 0
for i in range(36):
	sumprobs += a[i]  
	print a[i], ",",
print "sumprobs ", sumprobs
print "bins ", len(a)	

sumprobs = 0
print "offset ", offset
for i in range(36):
	print a_offset[i], ",",
	sumprobs += a_offset[i]  
print "sumprobs ", sumprobs
print "bins ", len(a_offset)	
	