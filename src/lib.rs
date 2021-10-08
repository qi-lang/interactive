/*
 * Copyright Qi Lang. 2021 All Rights Reserved.
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

use rustyline::error::ReadlineError;
use rustyline::Editor;

pub fn init<T: std::fmt::Debug>(parser: fn(&str) -> nom::IResult<&str, T>) {
    // `()` can be used when no completer is required
    let mut rl = Editor::<()>::new();
    let mut counter: usize = 0;
    if rl.load_history("history.txt").is_err() {
        println!("No previous history.");
    }
    loop {
        let readline = rl.readline(format!("qi({})>", &counter).as_str());
        match readline {
            Ok(line) => {
                rl.add_history_entry(line.as_str());
                let result = parser(&line);

                match result {
                    Ok((_, product)) => {
                        println!("{:?}", product);
                        counter += 1
                    }
                    Err(e) => match e {
                        nom::Err::Incomplete(i) => panic!("{:?}", i),
                        nom::Err::Error(i) => panic!("{:?}", i),
                        nom::Err::Failure(i) => panic!("{:?}", i),
                    },
                }
            }
            Err(ReadlineError::Interrupted) => {
                println!("CTRL-C");
                break;
            }
            Err(ReadlineError::Eof) => {
                println!("CTRL-D");
                break;
            }
            Err(err) => {
                println!("Error: {:?}", err);
                break;
            }
        }
    }
    // rl.save_history("history.txt").unwrap();
}
