async fn fetch_data() -> Result<String, Box<dyn std::error::Error>> {
    Ok(String::from("ok"))
}

async fn run() {
    let value = fetch_data().await;
    println!("{:?}", value);
}

fn main() {
    println!("zaxion incr test pr-b");
}
