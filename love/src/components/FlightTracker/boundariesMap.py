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


# testing.
lat_long = [-29.00657526492613, -69.77679793265125]
# print("new latitude", -30.240476801377167 +(200/6371)*180/math.pi)
# print("new longitude",-70.73709442008416 + (200/6371)*(180/math.pi)/math.cos(-30.240476801377167*math.pi/180))


# point_reference = [-29.672737573022122, -69.93171344197097]
# is_inside_area([-30.240476801377167, -70.73709442008416], point_reference,  200)

# with google maps.
external_radius = [-28.671508190008392, -69.72640645677438]
second_radius = [-29.057079010258132, -69.79391230365658]
intern_radius = [-29.672737573022122, -69.93171344197097]

# scale 13.
def distance(point_1, point_2):
    radio =  (math.sqrt((point_1[0] -point_2[0])**2 + (point_1[1]-point_2[1])**2))
    return radio

external_radius_c = [364.65891235520394, 60.57129669433607]
middle_radius_c = [357.00061695433305, 110.5181751002815]
intern_radius_c = [341.3675737065496, 190.66005738475087]

middle_radius_c2 = [382.104607855159, 74.27436233534718]
intern_radius_c2 = [362.80381215308626, 173.21876315578902]

intern_radius_c3 = [427.11252749269624, 120.89488046890165]
print(distance(intern_radius_c3,[250, 250])) 