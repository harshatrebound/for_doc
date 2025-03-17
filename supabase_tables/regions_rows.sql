INSERT INTO "public"."regions" ("id", "name", "slug", "collection_id", "meta_title", "meta_description", "region", "destinations_list", "created_at", "updated_at", "published_at") VALUES ('1', 'Central India', 'central-india', '665d637dbc07a265e7fe16ad', 'Team Building Destinations in Central India', 'Explore leading teambuilding destinations in Central India. Enjoy the heart of India with its mix of historical sites and modern amenities for effective team-building activities.', 'Central India', 'bhopal; jabalpur; raipur', '2024-06-03 06:38:07+00', '2024-06-03 12:22:33+00', '2025-01-08 10:08:59+00'), ('2', 'East India', 'east-india', '665d637dbc07a265e7fe16ad', 'Team Building Destinations in East India', 'Uncover premier teambuilding destinations in East India. Engage your team in rich cultural experiences and scenic landscapes for unforgettable bonding moments.', 'East India', 'kolkata; patna; ranchi; varanasi; visakapatnam', '2024-06-03 06:38:07+00', '2024-06-03 12:22:43+00', '2025-01-08 10:08:59+00'), ('3', 'North India', 'north-india', '665d637dbc07a265e7fe16ad', 'Team Building Destinations in North India', 'Explore top teambuilding destinations in North India. Discover vibrant cities and serene retreats perfect for fostering team spirit and collaboration.', 'North India', 'agra; dehradun; delhi; dharamshala; faridabad; ghaziabad; gurgaon; gwalior; jaipur; jim-corbett; kota; lucknow; ludhiana; meerut; noida; rishikesh; shimla; varanasi', '2024-06-03 06:38:08+00', '2024-06-03 12:22:23+00', '2025-01-08 10:08:59+00'), ('4', 'South India', 'south-india', '665d637dbc07a265e7fe16ad', 'Team Building Destinations in South India', 'Discover the best teambuilding destinations in South India. From tranquil backwaters to bustling cities, find the perfect spot for your next team event.', 'South India', 'alleppey; bangalore; chennai; chikmagalur; coimbatore; coorg; hyderabad; kabini; kerala; kochi; kodaikanal; mamallapuram; masinagudi; ooty; pondicherry; udupi; vijayawada; visakapatnam; warangal; wayanad; yelagiri; yelagiti; yercaud', '2024-06-03 06:38:08+00', '2024-06-03 12:22:01+00', '2025-01-08 10:08:59+00'), ('5', 'West India', 'west-india', '665d637dbc07a265e7fe16ad', 'Team Building Destinations in West India', 'Find the ideal teambuilding destinations in West India. Explore diverse locations that offer unique experiences for enhancing team synergy and productivity.', 'West India', 'ahmedabad; aurangabad; goa; indore; lonavala; mumbai; nashik; pune; rajkot; surat; thane; udaipur; vadodara', '2024-06-03 06:38:08+00', '2024-06-03 12:22:12+00', '2025-01-08 10:08:59+00'), ('16', 'International', 'international', '665d637dbc07a265e7fe16ad', 'International Team Building Destinations', 'Discover exceptional international team building destinations. Experience diverse cultures and unique locations for unforgettable corporate team experiences.', 'International', 'dubai; singapore; thailand; malaysia; bali; sri-lanka', '2024-06-03 06:38:08+00', '2024-06-03 12:22:12+00', '2025-01-08 10:08:59+00');

-- Update banner images for each region
UPDATE "public"."regions" 
SET "banner_image_url" = 'https://images.unsplash.com/photo-1590766940554-153a4d9afce7?auto=format&fit=crop&q=80'
WHERE "id" = '1';

UPDATE "public"."regions" 
SET "banner_image_url" = 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&q=80'
WHERE "id" = '2';

UPDATE "public"."regions" 
SET "banner_image_url" = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80'
WHERE "id" = '3';

UPDATE "public"."regions" 
SET "banner_image_url" = 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80'
WHERE "id" = '4';

UPDATE "public"."regions" 
SET "banner_image_url" = 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&q=80'
WHERE "id" = '5';

UPDATE "public"."regions" 
SET "banner_image_url" = 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&q=80'
WHERE "id" = '16';