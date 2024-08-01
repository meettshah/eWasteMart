import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Checkbox, Input, Link } from "@nextui-org/react";
// import { signIn, signOut } from "next-auth/react";
// import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation'
import Image from 'next/image'


export default function AuthModal() {
  // const { data: session } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();

  const logout = async () => {
    router.push('/');
    // await signOut();
  }

  return (
    <>
      {/* <Button onPress={session ? logout : onOpen} color="primary">{session ? "Logout" : "Login"}</Button> */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Log in</ModalHeader>
              <ModalBody>
                {/* <Button startContent={<Image alt="google-logo" src={'/google.svg'} height={40} width={40} className='h-12 w-12'/>} size='lg' color="primary" variant="ghost" onPress={() => { signIn('google') }}>Sign in with Google</Button>
                <Button startContent={<Image alt="github-logo" src={'/github.svg'} height={40} width={40} className='h-12 w-12'/>} size='lg' color="primary" variant="ghost" onPress={() => { signIn('github') }}>Sign in with GitHub</Button> */}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Sign in
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
