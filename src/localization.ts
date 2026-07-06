export const translations = {
  th: {
    // Login Screen
    login_system_name: "ระบบจัดการคลังพัสดุสิ้นเปลือง",
    login_title_left: "ระบบติดตามวัสดุสิ้นเปลือง\nคลังสินค้า (v2.0)",
    login_desc_left: "ระบบตรวจสอบและติดตามยอดวัสดุสิ้นเปลืองพัสดุคลังและสีพ่นโรงงานแบบบูรณาการ มีประสิทธิภาพสูง ปลอดภัยและบันทึกข้อมูลเรียลไทม์",
    login_status_required: "● จำเป็นต้องเข้าสู่ระบบผ่านบัญชีผู้ใช้ส่วนกลาง",
    login_right_header: "การเข้าถึงระบบสำหรับเจ้าหน้าที่",
    login_right_desc: "โปรดเชื่อมต่อบัญชี Google ที่ผ่านการอนุมัติเพื่อซิงโครไนซ์ข้อมูลเข้าสู่ฐานข้อมูลคลังพัสดุส่วนกลางเพื่อเริ่มใช้งาน",
    login_button_google: "ลงชื่อเข้าใช้งานด้วย Google",
    login_authenticating: "กำลังเข้าสู่ระบบ...",
    login_trouble: "มีปัญหาการล็อกอิน? คลิกเปิดในแท็บใหม่ (Open in New Tab) ด้านล่าง หากหน้าจออยู่ใน iFrame",
    login_secure_gateway: "เกตเวย์ความปลอดภัย V.2 // กำลังเริ่มต้นการเชื่อมต่อแบบเข้ารหัส...",
    login_ready: "● ระบบพร้อมให้บริการสำหรับการสื่อสาร",
    
    // Header
    nav_title: "ระบบควบคุมวัสดุคลังสินค้า",
    nav_subtitle: "Warehouse Consumables Monitor v2.0",
    btn_schemas: "พิมพ์ฉลาก QR & สถาปัตยกรรมระบบ",
    sign_out: "ออกจากระบบ",
    user_role_admin: "ผู้ดูแลระบบ",
    user_role_helper: "ทีมตรวจคลัง",
    user_role_qc: "ฝ่ายตรวจสอบคุณภาพ (QC)",

    // Tabs / Categories
    tab_overview: "ภาพรวมคลังสินค้า",
    tab_items: "รายการพัสดุสิ้นเปลือง",
    tab_cabinets: "ตู้และจุดเก็บพัสดุ",
    tab_departments: "แผนกการผลิต",
    tab_users: "จัดการสิทธิ์ผู้ใช้งาน",

    // Overview Tab
    stat_total_items: "รายการพัสดุทั้งหมด",
    stat_low_stock: "พัสดุวิกฤต (ต่ำกว่าเกณฑ์)",
    stat_total_cabinets: "จำนวนตู้วางพัสดุ",
    stat_total_depts: "แผนกที่รับผิดชอบ",
    stat_total_users: "เจ้าหน้าที่ในระบบ",
    chart_title: "กราฟเปรียบเทียบจำนวนสินค้าคงคลังปัจจุบัน (Current) กับระดับจุดสั่งซื้อขั้นต่ำ (Min Threshold)",
    chart_current: "คงคลังปัจจุบัน",
    chart_previous: "การตรวจรอบก่อน",
    chart_min: "จุดสั่งซื้อขั้นต่ำ",
    recent_activity: "ประวัติกิจกรรมล่าสุด",
    activity_inspection: "ตรวจเช็กคลัง",
    activity_consumption: "เบิกใช้สินค้า",
    no_recent_activity: "ไม่มีกิจกรรมล่าสุดในระบบ",

    // Items Tab
    item_search_placeholder: "ค้นหาชื่อพัสดุ, ตู้เก็บ, หรือแผนก...",
    btn_add_item: "เพิ่มรายการพัสดุใหม่",
    col_image: "รูปภาพ",
    col_name: "ชื่อพัสดุ",
    col_cabinet: "ตู้พิกัด",
    col_dept: "แผนกเจ้าของพัสดุ",
    col_stock: "คงเหลือปัจจุบัน",
    col_min: "จุดสั่งซื้อขั้นต่ำ",
    col_actions: "จัดการ",
    status_normal: "ปกติ",
    status_low: "ต้องสั่งซื้อด่วน",
    edit: "แก้ไข",
    delete: "ลบ",

    // Cabinets Tab
    cabinet_list: "รายการตู้และพิกัดจุดจัดเก็บ",
    btn_add_cabinet: "เพิ่มจุดจัดเก็บพัสดุ",
    col_cabinet_name: "ชื่อตู้วาง/รหัสตู้",
    col_location: "ตำแหน่งสถานที่ตั้งคลัง",
    col_qr_actions: "ฉลาก QR Code (ใช้สแกนเบิกพัสดุ)",
    btn_print_qr: "แสดง QR Code",
    qr_tip: "ทีมหน้างานสามารถสแกน QR Code นี้เพื่อเปิดหน้าบันทึกการเบิกพัสดุ หรือตรวจเช็กคลังของตู้ดังกล่าวได้ทันที",
    close: "ปิดหน้าต่าง",

    // Departments Tab
    dept_list: "แผนกและฝ่ายงานผู้ถือครองพัสดุ",
    btn_add_dept: "เพิ่มแผนกใหม่",
    col_dept_name: "ชื่อแผนก/ฝ่ายงาน",

    // Users Tab
    user_management: "การจัดการสิทธิ์และบัญชีผู้ใช้งาน",
    btn_add_user: "เชิญผู้ใช้งานใหม่",
    col_user_name: "ชื่อผู้ใช้",
    col_email: "อีเมล Google",
    col_role: "สิทธิ์การเข้าถึง",
    col_assigned_dept: "แผนกที่สังกัด",
    user_added_automatically: "ผู้ใช้ Google ที่ล็อกอินใหม่จะได้รับสิทธิ์เริ่มต้นเป็น 'ทีมตรวจคลัง (Helper)' อัตโนมัติ",

    // Modals & Forms
    modal_add: "เพิ่มข้อมูลใหม่",
    modal_edit: "แก้ไขข้อมูลพัสดุ",
    form_item_name: "ชื่อพัสดุสิ้นเปลือง",
    form_item_unit: "หน่วยนับ (เช่น EA, PK, Box, CAN, Roll)",
    form_item_image: "ลิงก์รูปภาพประกอบสินค้า",
    form_item_cabinet: "ตู้พิกัดจุดเก็บพัสดุ",
    form_item_dept: "แผนกรับผิดชอบพัสดุ",
    form_item_stock: "ยอดจำนวนเริ่มต้นคงคลัง",
    form_item_min: "ระดับจุดสั่งซื้อขั้นต่ำ (Min Threshold)",
    form_save: "บันทึกข้อมูล",
    form_cancel: "ยกเลิก",

    // Helper Count Module
    helper_panel_title: "โมดูลตรวจเช็กยอดคงคลังหน้าร้าน (Helper Stock Audit Panel)",
    helper_cabinet_select: "กรุณาเลือกตู้จัดเก็บเพื่อเริ่มนับพัสดุ:",
    helper_viewing_cabinet: "กำลังเข้าถึงตู้:",
    helper_desc: "พนักงานตรวจนับคลังกรุณากรอกปริมาณจริงที่อยู่ภายในตู้วางพัสดุ ยอดที่กรอกจะกลายเป็นจำนวนคงเหลือนับปัจจุบันทันทีเพื่ออัปเดตระบบหลัก",
    col_previous: "จำนวนตรวจครั้งก่อน",
    col_actual_count: "จำนวนที่ตรวจนับได้จริงในตู้",
    btn_submit_audit: "ยืนยันและอัปเดตยอดการตรวจนับคลังสินค้า",
    audit_success: "บันทึกยอดการตรวจนับคลังและอัปเดตสต็อกเรียบร้อยแล้ว!",

    // QC Consumption Module
    qc_panel_title: "โมดูลบันทึกการเบิกใช้พัสดุสิ้นเปลือง (QC & Production Consumption Pull)",
    qc_intro: "เจ้าหน้าที่ QC หรือผู้เบิกพัสดุ เลือกรายการวัสดุที่ต้องการดึงออกจากตู้วางพัสดุเพื่อระบุจำนวนเบิกและวัตถุประสงค์ในการเบิกใช้งาน",
    qc_select_item: "1. เลือกพัสดุสิ้นเปลืองที่จะเบิก:",
    qc_item_details: "พิกัดตู้เก็บ: {cabinet} | สังกัดแผนก: {dept} | ยอดคงคลังปัจจุบัน: {stock} {unit}",
    qc_pull_qty: "2. ระบุจำนวนพัสดุที่จะเบิกใช้งาน ({unit}):",
    qc_purpose: "3. ระบุวัตถุประสงค์ในการเบิกใช้สินค้า (เช่น ใช้พ่นสีตัวถัง, ซ่อมแซมระบบลม, ตรวจสอบคุณภาพ):",
    btn_submit_pull: "ยืนยันการเบิกและลดจำนวนสินค้าคงคลัง",
    pull_success: "บันทึกการเบิกสินค้าพัสดุเรียบร้อย ยอดจำนวนคงเหลือในระบบอัปเดตแล้ว!",

    // Errors & Confirmation
    confirm_delete: "คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?",
    err_required: "กรุณากรอกข้อมูลให้ครบถ้วน",
    err_low_stock_alert: "แจ้งเตือนสต็อกพัสดุต่ำกว่าเกณฑ์ความปลอดภัย!",

    // Blueprint / Code modal
    blueprint_modal_title: "เอกสารทางเทคนิคพัสดุ & ข้อมูลพิมพ์ป้าย QR",
    blueprint_desc: "ส่วนนี้แสดงเอกสารพิมพ์ป้ายคิวอาร์โค้ด และข้อมูลโครงสร้างฐานข้อมูลของระบบจัดการวัสดุสิ้นเปลืองคลังสินค้า",

    // Shared / Buttons
    change_lang: "ENG",
    sandbox_banner: "พื้นที่จำลองสำหรับทดสอบ (Sandbox)"
  },
  en: {
    // Login Screen
    login_system_name: "LOGITRACK SYSTEM",
    login_title_left: "WAREHOUSE CONSUMABLES\nMONITOR (v2.0)",
    login_desc_left: "A high-integrity asset tracking system designed for real-time warehouse audits, paint sprays, and consumables flow control.",
    login_status_required: "● CORE HUB AUTHENTICATION REQUIRED",
    login_right_header: "Personnel Access",
    login_right_desc: "Connect your verified personnel account to synchronize state across the distributed logic network and start editing inventory database.",
    login_button_google: "Authorize via Google",
    login_authenticating: "Authenticating...",
    login_trouble: "Trouble signing in? Try opening in a new tab if you're in an iframe preview.",
    login_secure_gateway: "SECURE_GATEWAY_V.2 // ESTABLISHING_HANDSHAKE...",
    login_ready: "● READY_FOR_COMMUNICATION",

    // Header
    nav_title: "Consumables Monitor",
    nav_subtitle: "Warehouse Consumables Monitor v2.0",
    btn_schemas: "Blueprint Code & Schemas",
    sign_out: "Sign Out",
    user_role_admin: "Super Admin",
    user_role_helper: "Helper Team",
    user_role_qc: "QC Pulls",

    // Tabs / Categories
    tab_overview: "Warehouse Overview",
    tab_items: "Consumable Items",
    tab_cabinets: "Cabinets & Locations",
    tab_departments: "Departments Owner",
    tab_users: "User Permissions",

    // Overview Tab
    stat_total_items: "Total Items",
    stat_low_stock: "Low Stock Alert Items",
    stat_total_cabinets: "Total Cabinets",
    stat_total_depts: "Total Departments",
    stat_total_users: "Registered Users",
    chart_title: "Inventory Stock Comparison: Current Level vs. Previous Level vs. Min Threshold Point",
    chart_current: "Current Level",
    chart_previous: "Previous Audit",
    chart_min: "Min Threshold",
    recent_activity: "Recent Activity Logs",
    activity_inspection: "Cabinet Stock Count",
    activity_consumption: "Consumable Withdraw Pull",
    no_recent_activity: "No recent activities recorded in the system.",

    // Items Tab
    item_search_placeholder: "Search by item name, cabinet, department...",
    btn_add_item: "Add New Consumable",
    col_image: "Image",
    col_name: "Consumable Item",
    col_cabinet: "Cabinet Point",
    col_dept: "Owning Department",
    col_stock: "Current Stock",
    col_min: "Min Threshold",
    col_actions: "Actions",
    status_normal: "Normal",
    status_low: "Low Stock",
    edit: "Edit",
    delete: "Delete",

    // Cabinets Tab
    cabinet_list: "Cabinets Location & Storage Map",
    btn_add_cabinet: "Add New Cabinet",
    col_cabinet_name: "Cabinet ID / Name",
    col_location: "Warehouse Physical Location",
    col_qr_actions: "Printable QR Label (Instant Scanner)",
    btn_print_qr: "Get QR Code",
    qr_tip: "Field personnel can scan this QR code using their devices to immediately pull up the Audit or Withdraw screen for this storage cabinet.",
    close: "Close Window",

    // Departments Tab
    dept_list: "Departments & Cost Ownership",
    btn_add_dept: "Add New Department",
    col_dept_name: "Department Title",

    // Users Tab
    user_management: "IAM & User Security Permissions",
    btn_add_user: "Invite New Personnel",
    col_user_name: "User Name",
    col_email: "Google Mail (Gmail)",
    col_role: "Assigned Security Role",
    col_assigned_dept: "Home Department",
    user_added_automatically: "Newly logged Google users are automatically assigned as 'Helper Team' permissions.",

    // Modals & Forms
    modal_add: "Add New Inventory Record",
    modal_edit: "Edit Consumable Item Details",
    form_item_name: "Consumable Item Title",
    form_item_unit: "Stock Unit (e.g., EA, PK, Box, CAN, Roll)",
    form_item_image: "Unsplash Image URL Reference",
    form_item_cabinet: "Target Storage Cabinet",
    form_item_dept: "Responsible Department",
    form_item_stock: "Initial Current Stock Quantity",
    form_item_min: "Minimum Safety Threshold Point",
    form_save: "Save Changes",
    form_cancel: "Cancel",

    // Helper Count Module
    helper_panel_title: "Field Helper Stock Count Audit",
    helper_cabinet_select: "Please select a cabinet to begin stock audit counting:",
    helper_viewing_cabinet: "Authorized Cabinet Interface:",
    helper_desc: "Please count and enter the exact quantity of items physically found inside this cabinet. Submitting will update the main stock quantities directly.",
    col_previous: "Previous Audit Stock",
    col_actual_count: "Actual Physical Count",
    btn_submit_audit: "Submit Physical Audit Quantities",
    audit_success: "Stock audit counts recorded, main inventories updated successfully!",

    // QC Consumption Module
    qc_panel_title: "QC & Production Consumables Pull",
    qc_intro: "Quality Control or Production operators can immediately select a consumable item to withdraw, specify pull quantities, and state purpose.",
    qc_select_item: "1. Select Consumable Item to Withdraw:",
    qc_item_details: "Cabinet: {cabinet} | Owning Dept: {dept} | Stock: {stock} {unit}",
    qc_pull_qty: "2. Quantities to Withdraw ({unit}):",
    qc_purpose: "3. Usage Purpose / Work Order Reference (e.g., Spray Body Parts, Air Valve Repair, Batch Audit):",
    btn_submit_pull: "Authorize Pull & Decrease Inventories",
    pull_success: "Withdraw recorded successfully, inventory quantities updated!",

    // Errors & Confirmation
    confirm_delete: "Are you sure you want to delete this record?",
    err_required: "Please fill out all required fields.",
    err_low_stock_alert: "Safety Stock Warning: Low inventory alert triggered!",

    // Blueprint / Code modal
    blueprint_modal_title: "Technical Blueprint & QR Printing Kit",
    blueprint_desc: "This dashboard displays database schemas, metadata, and QR code setups for the Warehouse Consumables System.",

    // Shared / Buttons
    change_lang: "ไทย",
    sandbox_banner: "Sandbox Simulation Mode"
  }
};
