import geojson
import math

path_to_file = './Valparaiso.geojson'
path_to_file_to_modify = './AtacamaTrue.geojson'


with open(path_to_file) as f:
    gj = geojson.load(f)

# with open(path_to_file_to_modify) as f:
#     gj_modified = geojson.load(f)

all_coordinates = []

# feat_len = len(gj['features'])
# print( "cantidad de features", feat_len)
# for i in range(0, feat_len):
#     coord_len = len(gj['features'][i]['geometry']['coordinates'])
#     for j in range(0, coord_len):
#        print(gj['features'][i]['geometry']["type"])
#       for w in range(0, elements_coord_len):
#             for k in gj['features'][i]['geometry']['coordinates'][j][w]:
#                 print(k)

def is_inside_area(origin, test_point, radius):
    earth_radius = 6371 # in km
    angle_1 = (origin[0]) * math.pi/180 # in radians
    angle_2 = (test_point[0]) * math.pi/180
    delta_angle1 = (test_point[0] - origin[0]) * math.pi/180
    delta_angle2 = (test_point[1] - origin[1]) * math.pi/180
    
    a = math.sin(delta_angle1/2)**2 + \
        math.cos(angle_1) * math.cos(angle_2) * math.sin(delta_angle2/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    d = earth_radius * c # in km 

    print( "radio actual", d)

    if d <= radius: 
        return "True" 
    else: 
        return "False"

# print("new latitude", -30.24037 +(200/6371)*180/math.pi)
# print("new longitude",-70.73691 + (200/6371)*(180/math.pi)/math.cos(-30.24037*math.pi/180))
# is_inside_area([-30.24037, -70.73691], [-28.441726788162537, -68.65495464709075], 200 )
# print((-28.441726788162537 +30.24037)*111.11, 111)
# point_reference = [-31.918213039964222, -70.24057012821072]
is_inside_area([-30.24037, -70.73691], point_reference,  200 )