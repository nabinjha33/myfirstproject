| table_name          | column_name           | data_type                | is_nullable | column_default                   | character_maximum_length |
| ------------------- | --------------------- | ------------------------ | ----------- | -------------------------------- | ------------------------ |
| brands              | id                    | uuid                     | NO          | uuid_generate_v4()               | null                     |
| brands              | name                  | text                     | NO          | null                             | null                     |
| brands              | slug                  | text                     | NO          | null                             | null                     |
| brands              | description           | text                     | YES         | null                             | null                     |
| brands              | logo                  | text                     | YES         | null                             | null                     |
| brands              | origin_country        | text                     | YES         | null                             | null                     |
| brands              | established_year      | text                     | YES         | null                             | null                     |
| brands              | specialty             | text                     | YES         | null                             | null                     |
| brands              | active                | boolean                  | YES         | true                             | null                     |
| brands              | sort_order            | integer                  | YES         | 0                                | null                     |
| brands              | created_at            | timestamp with time zone | YES         | now()                            | null                     |
| brands              | updated_at            | timestamp with time zone | YES         | now()                            | null                     |
| categories          | id                    | uuid                     | NO          | uuid_generate_v4()               | null                     |
| categories          | name                  | text                     | NO          | null                             | null                     |
| categories          | slug                  | text                     | NO          | null                             | null                     |
| categories          | description           | text                     | YES         | null                             | null                     |
| categories          | icon                  | text                     | YES         | null                             | null                     |
| categories          | color                 | text                     | YES         | null                             | null                     |
| categories          | parent_id             | uuid                     | YES         | null                             | null                     |
| categories          | active                | boolean                  | YES         | true                             | null                     |
| categories          | sort_order            | integer                  | YES         | 0                                | null                     |
| categories          | created_at            | timestamp with time zone | YES         | now()                            | null                     |
| categories          | updated_at            | timestamp with time zone | YES         | now()                            | null                     |
| dealer_applications | id                    | uuid                     | NO          | uuid_generate_v4()               | null                     |
| dealer_applications | business_name         | text                     | NO          | null                             | null                     |
| dealer_applications | contact_person        | text                     | NO          | null                             | null                     |
| dealer_applications | email                 | text                     | NO          | null                             | null                     |
| dealer_applications | phone                 | text                     | NO          | null                             | null                     |
| dealer_applications | whatsapp              | text                     | YES         | null                             | null                     |
| dealer_applications | address               | text                     | NO          | null                             | null                     |
| dealer_applications | vat_pan               | text                     | YES         | null                             | null                     |
| dealer_applications | business_type         | text                     | NO          | null                             | null                     |
| dealer_applications | years_in_business     | text                     | NO          | null                             | null                     |
| dealer_applications | interested_brands     | ARRAY                    | YES         | '{}'::text[]                     | null                     |
| dealer_applications | annual_turnover       | text                     | YES         | null                             | null                     |
| dealer_applications | experience_years      | integer                  | YES         | null                             | null                     |
| dealer_applications | message               | text                     | YES         | null                             | null                     |
| dealer_applications | status                | text                     | YES         | 'pending'::text                  | null                     |
| dealer_applications | created_at            | timestamp with time zone | YES         | now()                            | null                     |
| dealer_applications | updated_at            | timestamp with time zone | YES         | now()                            | null                     |
| orders              | id                    | uuid                     | NO          | uuid_generate_v4()               | null                     |
| orders              | order_number          | text                     | NO          | null                             | null                     |
| orders              | dealer_id             | uuid                     | YES         | null                             | null                     |
| orders              | dealer_email          | text                     | NO          | null                             | null                     |
| orders              | dealer_name           | text                     | NO          | null                             | null                     |
| orders              | contact_person        | text                     | NO          | null                             | null                     |
| orders              | contact_phone         | text                     | NO          | null                             | null                     |
| orders              | status                | text                     | YES         | 'pending'::text                  | null                     |
| orders              | order_date            | timestamp with time zone | YES         | now()                            | null                     |
| orders              | items                 | jsonb                    | NO          | '[]'::jsonb                      | null                     |
| orders              | total_items           | integer                  | YES         | 0                                | null                     |
| orders              | estimated_total_value | numeric                  | YES         | 0                                | null                     |
| orders              | additional_notes      | text                     | YES         | null                             | null                     |
| orders              | inquiry_type          | text                     | YES         | 'order'::text                    | null                     |
| orders              | created_at            | timestamp with time zone | YES         | now()                            | null                     |
| orders              | updated_at            | timestamp with time zone | YES         | now()                            | null                     |
| page_visits         | id                    | uuid                     | NO          | uuid_generate_v4()               | null                     |
| page_visits         | path                  | text                     | NO          | null                             | null                     |
| page_visits         | page                  | text                     | NO          | null                             | null                     |
| page_visits         | user_email            | text                     | YES         | null                             | null                     |
| page_visits         | user_agent            | text                     | YES         | null                             | null                     |
| page_visits         | visited_at            | timestamp with time zone | YES         | now()                            | null                     |
| page_visits         | created_at            | timestamp with time zone | YES         | now()                            | null                     |
| products            | id                    | uuid                     | NO          | uuid_generate_v4()               | null                     |
| products            | name                  | text                     | NO          | null                             | null                     |
| products            | slug                  | text                     | NO          | null                             | null                     |
| products            | description           | text                     | YES         | null                             | null                     |
| products            | brand_id              | uuid                     | YES         | null                             | null                     |
| products            | category_id           | uuid                     | YES         | null                             | null                     |
| products            | images                | ARRAY                    | YES         | '{}'::text[]                     | null                     |
| products            | variants              | jsonb                    | YES         | '[]'::jsonb                      | null                     |
| products            | featured              | boolean                  | YES         | false                            | null                     |
| products            | active                | boolean                  | YES         | true                             | null                     |
| products            | created_at            | timestamp with time zone | YES         | now()                            | null                     |
| products            | updated_at            | timestamp with time zone | YES         | now()                            | null                     |
| shipments           | id                    | uuid                     | NO          | uuid_generate_v4()               | null                     |
| shipments           | tracking_number       | text                     | NO          | null                             | null                     |
| shipments           | origin_country        | text                     | NO          | null                             | null                     |
| shipments           | status                | text                     | YES         | 'pending'::text                  | null                     |
| shipments           | eta_date              | date                     | YES         | null                             | null                     |
| shipments           | product_names         | ARRAY                    | YES         | '{}'::text[]                     | null                     |
| shipments           | port_name             | text                     | YES         | null                             | null                     |
| shipments           | last_updated          | timestamp with time zone | YES         | now()                            | null                     |
| shipments           | created_at            | timestamp with time zone | YES         | now()                            | null                     |
| shipments           | updated_at            | timestamp with time zone | YES         | now()                            | null                     |
| site_settings       | id                    | uuid                     | NO          | uuid_generate_v4()               | null                     |
| site_settings       | company_name          | text                     | NO          | 'Jeen Mata Impex'::text          | null                     |
| site_settings       | tagline               | text                     | YES         | 'Premium Import Solutions'::text | null                     |
| site_settings       | contact_email         | text                     | YES         | 'jeenmataimpex8@gmail.com'::text | null                     |
| site_settings       | contact_phone         | text                     | YES         | '+977-1-XXXXXXX'::text           | null                     |
| site_settings       | contact_address       | text                     | YES         | 'Kathmandu, Nepal'::text         | null                     |
| site_settings       | logo_url              | text                     | YES         | null                             | null                     |
| site_settings       | website_url           | text                     | YES         | null                             | null                     |
| site_settings       | created_at            | timestamp with time zone | YES         | now()                            | null                     |
| site_settings       | updated_at            | timestamp with time zone | YES         | now()                            | null                     |
| users               | id                    | text                     | NO          | null                             | null                     |
| users               | email                 | text                     | NO          | null                             | null                     |
| users               | full_name             | text                     | YES         | null                             | null                     |
| users               | role                  | text                     | YES         | 'dealer'::text                   | null                     |
| users               | dealer_status         | text                     | YES         | 'pending'::text                  | null                     |
| users               | business_name         | text                     | YES         | null                             | null                     |
| users               | phone                 | text                     | YES         | null                             | null                     |
| users               | whatsapp              | text                     | YES         | null                             | null                     |
| users               | address               | text                     | YES         | null                             | null                     |
| users               | vat_pan               | text                     | YES         | null                             | null                     |
| users               | created_at            | timestamp with time zone | YES         | now()                            | null                     |
| users               | updated_at            | timestamp with time zone | YES         | now()                            | null                     |
| users               | clerk_id              | text                     | YES         | null                             | null                     |

| table_name | column_name | foreign_table_name | foreign_column_name | constraint_name           |
| ---------- | ----------- | ------------------ | ------------------- | ------------------------- |
| categories | parent_id   | categories         | id                  | categories_parent_id_fkey |
| products   | brand_id    | brands             | id                  | products_brand_id_fkey    |
| products   | category_id | categories         | id                  | products_category_id_fkey |

| schemaname | tablename     | policyname                                | permissive | roles    | cmd    | qual                                                                                                                      | with_check                                                                                                                |
| ---------- | ------------- | ----------------------------------------- | ---------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| public     | page_visits   | Allow public insert to page_visits        | PERMISSIVE | {public} | INSERT | null                                                                                                                      | true                                                                                                                      |
| public     | site_settings | Allow public read access to site_settings | PERMISSIVE | {public} | SELECT | true                                                                                                                      | null                                                                                                                      |
| public     | users         | Admins can insert users                   | PERMISSIVE | {public} | INSERT | null                                                                                                                      | (EXISTS ( SELECT 1
   FROM users users_1
  WHERE ((users_1.id = (auth.uid())::text) AND (users_1.role = 'admin'::text)))) |
| public     | users         | Admins can update all users               | PERMISSIVE | {public} | UPDATE | (EXISTS ( SELECT 1
   FROM users users_1
  WHERE ((users_1.id = (auth.uid())::text) AND (users_1.role = 'admin'::text)))) | null                                                                                                                      |
| public     | users         | Admins can view all users                 | PERMISSIVE | {public} | SELECT | (EXISTS ( SELECT 1
   FROM users users_1
  WHERE ((users_1.id = (auth.uid())::text) AND (users_1.role = 'admin'::text)))) | null                                                                                                                      |
| public     | users         | Allow initial admin creation              | PERMISSIVE | {public} | INSERT | null                                                                                                                      | (role = 'admin'::text)                                                                                                    |
| public     | users         | Users can update their own data           | PERMISSIVE | {public} | UPDATE | ((auth.uid())::text = id)                                                                                                 | null                                                                                                                      |
| public     | users         | Users can view their own data             | PERMISSIVE | {public} | SELECT | ((auth.uid())::text = id)                                                                                                 | null                                                                                                                      |