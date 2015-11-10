-- Author: Yu Pei
-- Date: 11/10/2015
-- PL/Python script to download Daymet by pixel, output weather_t table.

CREATE OR REPLACE FUNCTION get(lat float, lon float, st integer, ed integer)
RETURNS SETOF m3pgjs.weather_t AS
$BODY$

import urllib2
import csv
import calendar
import math

res = [] # result
years = range(st, ed+1)
years = [str(x) for x in years]
years = ",".join(years)
mycalendar = calendar.Calendar() # create new obj
data = urllib2.urlopen('https://daymet.ornl.gov/data/send/saveData?lat='+ str(lat)+'&lon=' + str(lon) + '&year=' + years)
cr = csv.reader(data)
for i in range(8):
	# Get rid of the header
	a = cr.next()


for yr in range(st, ed+1):
	for mn in range(1,13):
		i = 0.0 # day count
		cur = mycalendar.itermonthdays(2010, mn)
		ptr = [0 for _ in range(6)]
		for day in cur:
			if day == 0:
				continue
			i += 1.0
			temp = cr.next()
			temp = [float(x) for x in temp]
			ptr[0] += temp[7] # tmin
			ptr[1] += temp[6] # tmax
			temp[8] = temp[8]/1000. # tdmean
			temp[8] = (math.log(temp[8]/0.6108)*237.3)/(17.27 - math.log(temp[8]/0.6108))
			ptr[2] += temp[8]
			ptr[3] += temp[3] # prcp
			ptr[4] += temp[4]*temp[2]/1e6 # srad
			ptr[5] += temp[2]/3600.0 # dayl
		ptr[0] /= i
		ptr[1] /= i
		ptr[2] /= i
		ptr[4] /= i
		ptr[5] /= i
		res.append(ptr)

return(res)
 
$BODY$
LANGUAGE plpythonu STRICT;

