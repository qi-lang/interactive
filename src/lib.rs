/*
 * Copyright Qi Lang. 2021 All Rights Reserved.
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

pub fn init<T>(parser: fn(&str) -> nom::IResult<&str, T>)
where
    T: std::fmt::Debug,
{
    let mut editor = rustyline::Editor::<()>::new();
    let mut counter: usize = 0;

    let home_dir = match dirs::home_dir() {
        Some(path) => format!("{}", path.as_path().to_str().unwrap()),
        None => panic!("A home directory was not found"),
    };

    let qi_folder = format!("{}/.qi/", home_dir);

    let history_file = "history.log";

    let history_file_path = format!("{}{}", qi_folder, history_file);

    if editor.load_history(history_file_path.as_str()).is_err() {
        println!("No previous history found.");

        let folders = std::fs::create_dir_all(qi_folder);

        match folders {
            Ok(_) => {
                let file = std::fs::write(&history_file_path, "");
                match file {
                    Ok(_) => println!("File created at: {}", &history_file_path),
                    Err(e) => panic!("{}", e),
                }
            }
            Err(e) => panic!("{}", e),
        }
    }

    loop {
        let readline = editor.readline(format!("qi({})>", &counter).as_str());

        match readline {
            Ok(line) => {
                editor.add_history_entry(line.as_str());

                let result = parser(&line);

                match result {
                    Ok((_, product)) => {
                        println!("{:#?}", product);
                        counter += 1
                    }
                    Err(e) => match e {
                        nom::Err::Incomplete(i) => {
                            eprintln!("Incomplete: {:#?}", i);
                        }
                        nom::Err::Error(i) => {
                            eprintln!("Error: {:#?}", i);
                        }
                        nom::Err::Failure(i) => {
                            eprintln!("Failure: {:#?}", i);
                        }
                    },
                }

                //
            }
            Err(rustyline::error::ReadlineError::Interrupted) => {
                println!("CTRL-C");
                break;
            }
            Err(rustyline::error::ReadlineError::Eof) => {
                println!("CTRL-D");
                break;
            }
            Err(err) => {
                println!("Error: {:?}", err);
                break;
            }
        }
    }
    editor.save_history(history_file_path.as_str()).unwrap();
}
